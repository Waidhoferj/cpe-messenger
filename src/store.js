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
    groups: [],
    conversations: [],
    errors: []
  },
  mutations: {
    setGroups(state, groups) {
      state.groups = groups;
    },
    setUser(state, user) {
      state.user = user.uid;
    },
    /**
     * Adds new group locally.
     * @param {object} group the name and phone numbers for the new text group
     */
    addGroup(state, group) {
      state.groups[group.name] = group.data;
      state.groupNames.push(parseNameFrom(group.name));
    },
    /**
     * Adds new members to group locally
     */
    updateGroupMembers(state, { groupName, members }) {
      members.forEach(member => {
        if (!state.groups[groupName].includes(member))
          state.groups[groupName].push(member);
      });
    },
    /**
     * Sets initial value of group names in first server fetch
     * @param {array} groupNames group names from server
     */
    setGroupNames(state, groupNames) {
      state.groupNames = groupNames;
    },
    updateConversations(state, update) {
      let initialUpdate = !state.conversations.length;
      const matchingConversation = conversation =>
        conversation.from === update.from;
      const itemToUpdate = state.conversations.find(matchingConversation);
      if (!itemToUpdate) {
        state.conversations.push(update);
        return;
      }
      if (itemToUpdate.messages.length >= update.messages.length) return;
      let newMessage = update.messages[update.messages.length - 1];
      itemToUpdate.messages.push(newMessage);
      //Notify User
      let cancelNotification =
        !window.Notification ||
        Notification.permission !== "granted" ||
        initialUpdate ||
        newMessage.sender === "messenger";
      if (cancelNotification) return;
      let notification = new Notification(
        itemToUpdate.nickname || itemToUpdate.from,
        {
          body: newMessage.text,
          icon: "/assets/message-tag.png"
        }
      );
      notification.onclick = () => {
        router.push("/conversations");
      };
      setTimeout(() => {
        notification.close();
      }, 6000);
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
        ? commit("setGroupNames", groupsList)
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
    async getGroupListings({ commit }) {
      let pointers = await db.collection("textGroups").get();
      let groups = {};
      pointers.forEach(pointer => {
        if (pointer.id !== "GroupsInfo")
          groups[pointer.id] = pointer.data().phoneNumbers;
      });
      commit("setGroups", groups);
    },
    /**
     * Adds a new text group to choose from when sending announcements
     * @param {*} group the name of the new text group and the associated phone numbers
     */
    async createTextGroup({ commit }, group) {
      commit("addGroup", group);
      await db
        .collection("textGroups")
        .doc(group.name)
        .set({ phoneNumbers: group.data });
    },
    signUpUser(context, userInfo) {
      return axios.post(
        "https://us-central1-cpentrepreneurs-e2e22.cloudfunctions.net/signUpWithCode",
        userInfo
      );
    },
    removeGroupMember({ state }, { group, member }) {
      let removeIndex = state.groups[group].indexOf(member);
      if (removeIndex < 0) return;
      state.groups[group].splice(removeIndex, 1);
      return db
        .collection("textGroups")
        .doc(group)
        .update({
          phoneNumbers: firebase.firestore.FieldValue.arrayRemove(member)
        });
    },
    addGroupMembers({ state, commit }, { group, members }) {
      commit("updateGroupMembers", { groupName: group, members });
      return db
        .collection("textGroups")
        .doc(group)
        .update({
          phoneNumbers: firebase.firestore.FieldValue.arrayUnion(...members)
        });
    },
    notifyUser(text, sender) {
      if (!window.Notification || Notification.permission !== "granted") return;
      let notification = new Notification(text, { tag: sender });
      notification.onclick = () => {
        router.push("/conversations");
      };
      setTimeout(() => {
        notification.close();
      }, 4000);
    },
    async deleteConversation({ state }, { conversation }) {
      let removeIndex = state.conversations.indexOf(conversation);
      state.conversations.splice(removeIndex, 1);

      let pointers = await db
        .collection("conversations")
        .where("from", "==", conversation.from)
        .get();
      let ids = [];
      pointers.forEach(pointer => {
        ids.push(pointer.id);
      });
      if (!ids.length)
        return console.error("Couldn't find conversation to delete");
      db.collection("conversations")
        .doc(ids[0])
        .delete();
    }
  }
});
