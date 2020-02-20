import Vue from "vue";
import Vuex from "vuex";

const axios = require("axios");

import router from "./router";
import { parseNameFrom } from "@/modules/parser";
import { attachListeners, trackAuthState } from "@/modules/listeners";
import { db, auth } from "@/modules/fbConfig";
import firebase from "firebase/app";
Vue.use(Vuex);

//AUTH
trackAuthState(auth);

export default new Vuex.Store({
  state: {
    user: null,
    groupNames: [],
    groups: [],
    conversations: [],
    announcementQueue: [],
    listenersActive: false
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
    /**
     * Updates a conversation when a new text message is recieved
     * @param update New message from a clients device in a text conversation
     */
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
    /**
     * Clears all state and user data and signs user out of Firebase session.
     */
    logOut(state) {
      state.user = null;
      state.groupNames = ["CPE Club"];
      state.conversations = [];
      state.errors = [];
      return auth.signOut();
    },
    /**
     * Handles any server changes that effect the announcement queue
     * @param {string} operation payload property which identifies what type of change has occurred. Keywords modeled after firestore's change.type enum.
     * @param data payload property which holds the changed document.
     */
    updateQueue(state, { operation, data }) {
      switch (operation) {
        case "added":
          state.announcementQueue.push(data);
          break;
        case "modified":
          console.log("TODO: add modification function to the queue");
          break;

        case "removed":
          let elToDelete = el =>
            el.timestamp === data.timestamp && el.text === data.text;
          let removeIndex = state.announcementQueue.findIndex(elToDelete);
          if (removeIndex < 0) return;
          state.announcementQueue.splice(removeIndex, 1);
          break;
        default:
          break;
      }
    }
  },
  actions: {
    /**
     * Logs in user and fetches active message groups for posting announcements.
     * @param {Object} user The identifying email and password of the user.
     */
    async logIn({ dispatch }, user) {
      const userData = await auth.signInWithEmailAndPassword(
        user.email,
        user.password
      );
      await dispatch("fetchCoreData");
    },
    /**
     * Fetches necessary initial data from server to populate first page of app. Will set
     */
    async fetchCoreData({ state, dispatch, commit }) {
      if (!state.listenersActive) attachListeners(db, auth);
      let res = {};
      try {
        res = await dispatch("getData", `textGroups/GroupsInfo`);
      } catch (err) {
        console.err(err.message);
      }
      let { groupsList } = res;
      groupsList
        ? commit("setGroupNames", groupsList)
        : console.error("no groups found");
    },
    /**
     * Uploads text message from CPE Messenger to the server, sending the message to the recipient's phone.
     * @param {*} testMessage A message from the conversations page that includes the recipient's number and the textual content of the message.
     */
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
    /**
     * Updates the name of the conversation in the server, allowing the exchange to be referenced by a name instead of phone number.
     * @param {*} conversation The conversation object to be updated (from the Conversations page)
     */
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
    /**
     * Gets the document at the end of the provided path from the server.
     * @param {*} path the slash separated path to the document in the server
     */
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
    //TODO
    /**
     * Queues mass text announcement to be sent by text provider
     */
    sendAnnouncement(_, announcement) {
      return db.collection("announcements").add(announcement);
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
    /**
     * Validates new user's access code with a Firebase Function and creates user account.
     * @param {*} userInfo name, email, password, and access code
     */
    signUpUser(context, userInfo) {
      return axios.post(
        "https://us-central1-cpentrepreneurs-e2e22.cloudfunctions.net/signUpWithCode",
        userInfo
      );
    },
    /**
     * Removes subscriber from a messaging group.
     * @param {Object} payload the member to remove and their corresponding group.
     */
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
    /**
     * Add subscriber number to a mass text group.
     * @param {*} payload the member to add and their corresponding group.
     */
    addGroupMembers({ state, commit }, { group, members }) {
      commit("updateGroupMembers", { groupName: group, members });
      return db
        .collection("textGroups")
        .doc(group)
        .update({
          phoneNumbers: firebase.firestore.FieldValue.arrayUnion(...members)
        });
    },
    /**
     * Deletes conversation from the server.
     * @param {*} conversation conversation within the Vuex store's inventory to be deleted.
     */
    async deleteConversation({ state }, conversation) {
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
    },
    /**
     * Deletes announcement in server.
     * @param {*} announcement the announcement to delete
     */
    async deleteAnnouncement({ commit }, announcement) {
      let pointers = await db
        .collection("announcements")
        .where("text", "==", announcement.text)
        .get();
      let ids = [];
      pointers.forEach(({ id }) => ids.push(id));
      if (!ids.length) return;
      return db
        .collection("announcements")
        .doc(ids[0])
        .delete();
    }
  }
});
