import Vue from "vue";
import Vuex from "vuex";

const axios = require("axios");
import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
import router from "./router";
import { parseNameFrom } from "@/modules/groupParser";
import firebaseConfig from "@/modules/fbConfig.js";
import { attachListeners } from "@/modules/listeners";

firebase.initializeApp(firebaseConfig);
Vue.use(Vuex);

const db = firebase.firestore();
const auth = firebase.auth();

export default new Vuex.Store({
  state: {
    user: {},
    groupNames: ["CPE Club"],
    conversations: [],
    errors: []
  },
  mutations: {
    updateUser(state, user) {
      state.user = user;
    },
    updateGroupNames(state, groups) {
      state.groupNames = groups.map(parseNameFrom);
    },
    updateConversations(state, update) {
      const matchingConversation = conversation =>
        conversation.from === update.from;
      console.log("update", update);
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
      state.user = {};
      state.groupNames = ["CPE Club"];
      state.conversations = [];
      auth.logOut();
    }
  },
  actions: {
    async logIn({ dispatch, commit }, user) {
      console.log("user", user);
      const userData = await auth.signInWithEmailAndPassword(
        user.email,
        user.password
      );
      attachListeners(db, auth);
      const [profile, { groupsList }] = await Promise.all([
        dispatch("getData", `users/${userData.user.uid}`),
        dispatch("getData", `textGroups/GroupsInfo`)
      ]);
      console.log("test:", profile, groupsList);
      profile ? commit("updateUser", profile) : console.error("no user found");
      groupsList
        ? commit("updateGroupNames", groupsList)
        : console.error("no groups found");
    },

    async sendResponse({ state }, { message, recipient }) {
      console.log("message data", message, recipient);
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
      console.log({ path });
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
      console.log("pointers", pointers);
      pointers.forEach(pointer =>
        console.log("pointer:data: ", pointer.data())
      );
      pointers.forEach(
        pointer => (groups[pointer.id] = pointer.data().phoneNumbers)
      );
      return groups;
    },
    createTextGroup(context, { name, data }) {
      return db
        .collection("textGroups")
        .doc(name)
        .set({ phoneNumbers: data });
    }
  }
});
