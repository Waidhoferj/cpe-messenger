import Vue from "vue";
import Vuex from "vuex";

const axios = require("axios");
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import router from "./router";
import { parseNameFrom } from "@/modules/parser";
import firebaseConfig from "@/modules/fbConfig.js";
import { attachListeners, trackAuthState } from "@/modules/listeners";

firebase.initializeApp(firebaseConfig);
Vue.use(Vuex);

const db = firebase.firestore();
const auth = firebase.auth();
//AUTH
trackAuthState(auth);

export default new Vuex.Store({
  state: {
    user: null,
    groupNames: ["CPE Club"],
    conversations: [],
    errors: []
  },
  mutations: {
    setUser(state, user) {
      state.user = user.uid;
    },
    updateGroupNames(state, groups) {
      state.groupNames = groups.map(parseNameFrom);
    },
    updateConversations(state, update) {
      const matchingConversation = conversation =>
        conversation.from === update.from;
      const itemToUpdate = state.conversations.find(matchingConversation);
      if (!itemToUpdate) {
        state.conversations.push(update);
        return;
      }
      if (itemToUpdate.messages.length >= update.messages.length) return;
      let newMessageIndex = update.messages.length - 1;
      itemToUpdate.messages.push(update.messages[newMessageIndex]);
    },
    updateErrors({ errors }, error) {
      let date = new Date(error.timestamp).toLocaleDateString();
      if (date in errors) errors[date].push(error);
      else errors[date] = [error];
    },
    setConversations(state, conversations) {
      state.conversations = conversations;
    },
    logOut(state) {
      state.user = null;
      state.groupNames = ["CPE Club"];
      state.conversations = [];
      state.errors = [];
      auth.logOut();
    }
  },
  actions: {
    async logIn({ dispatch, commit }, user) {
      const userData = await auth.signInWithEmailAndPassword(
        user.email,
        user.password
      );
      attachListeners(db, auth);
      const { groupsList } = await dispatch("getData", `textGroups/GroupsInfo`);
      groupsList
        ? commit("updateGroupNames", groupsList)
        : console.error("no groups found");
    },

    async sendResponse({ state }, { message, recipient }) {
      let pointers = await db
        .collection("conversations")
        .where("from", "==", recipient)
        .get();
      let ids = [];
      pointers.forEach(pointer => ids.push(pointer.id));
      if (!ids.length)
        return console.warn("couldn't locate conversation in server");
      await db
        .collection("conversations")
        .doc(ids[0])
        .update({
          messages: firebase.firestore.FieldValue.arrayUnion(message)
        });
    },

    async updateNickname(context, { nickname, from: recipient }) {
      let pointers = await db
        .collection("conversations")
        .where("from", "==", recipient)
        .get();
      let ids = [];
      pointers.forEach(pointer => ids.push(pointer.id));
      if (!ids.length)
        return console.warn("couldn't locate conversation in server");
      await db
        .collection("conversations")
        .doc(ids[0])
        .update({
          nickname
        });
    },

    async getData(_, path) {
      const [group, item] = path.split("/");
      let pointer = await db
        .collection(group)
        .doc(item)
        .get();
      if (!pointer.exists)
        return console.warn(`Could not find any data at ${path}`);
      return pointer.data();
    },

    sendMessage(_, message) {
      return db.collection("announcements").add(message);
    },
    async getGroupListings() {
      let pointers = await db.collection("textGroups").get();
      let groups = {};
      pointers.forEach(pointer => {
        if (pointer.id !== "GroupsInfo")
          groups[pointer.id] = pointer.data().phoneNumbers;
      });
      return groups;
    },
    createTextGroup(context, { name, data }) {
      return db
        .collection("textGroups")
        .doc(name)
        .set({ phoneNumbers: data });
    },
    signUpUser(context, userInfo) {
      return axios.post(
        "https://us-central1-cpentrepreneurs-e2e22.cloudfunctions.net/signUpWithCode",
        userInfo
      );
    },
    removeGroupMember(state, { group, member }) {
      return db
        .collection("textGroups")
        .doc(group)
        .update({
          phoneNumbers: firebase.firestore.FieldValue.arrayRemove(member)
        });
    }
  }
});
