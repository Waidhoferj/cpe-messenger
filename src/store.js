import Vue from "vue";
import Vuex from "vuex";

const axios = require("axios");
const firebase = require("firebase");
import router from "./router";
import { parseNameFrom } from "@/modules/groupParser";

var firebaseConfig = {
  apiKey: "AIzaSyAnaSoE2Rk5tI6BDWWjyoLtGvRg0wr3d1Y",
  authDomain: "cpentrepreneurs-e2e22.firebaseapp.com",
  databaseURL: "https://cpentrepreneurs-e2e22.firebaseio.com",
  projectId: "cpentrepreneurs-e2e22",
  storageBucket: "cpentrepreneurs-e2e22.appspot.com",
  messagingSenderId: "262626193290",
  appId: "1:262626193290:web:ff81c5eff6993b06"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// firebase.auth().onAuthStateChanged(function(user) {
//   if (user) {
//     console.log("listener passes user", user);
//   } else {
//     router.push("/");
//   }
// });

const db = firebase.firestore();
const auth = firebase.auth();

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    user: {},
    groups: ["CPE Club", "Startup Marathon", "tours"]
  },
  mutations: {
    updateUser(state, user) {
      state.user = user;
    },
    updateGroups(state, groups) {
      state.groups = groups.map(parseNameFrom);
    }
  },
  actions: {
    async logIn({ dispatch, commit }, user) {
      console.log("user", user);
      const userData = await auth.signInWithEmailAndPassword(
        user.email,
        user.password
      );
      const [profile, groupsInfo] = await Promise.all([
        dispatch("getData", `users/${userData.user.uid}`),
        dispatch("getData", `subscribers/groupsInfo`)
      ]);
      console.log("test:", profile, groupsInfo);
      profile ? commit("updateUser", profile) : console.error("no user found");
      groupsInfo
        ? commit("updateGroups", groupsInfo)
        : console.error("no groups found");
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
