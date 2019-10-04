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
    groups: ["CPE Club", "Startup Marathon", "tours"],
    conversations: []
  },
  mutations: {
    updateUser(state, user) {
      state.user = user;
    },
    updateGroups(state, groups) {
      state.groups = groups.map(parseNameFrom);
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
    setConversations(state, conversations) {
      state.conversations = conversations;
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
        ? commit("updateGroups", groupsList)
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

    async sendMessage(_, message) {
      await db.collection("announcements").add(message);
    }
  }
});
