import firebase from "firebase/app";
import "firebase/firestore";
import "firebase/auth";
firebase.initializeApp({
  apiKey: process.env.VUE_APP_KEY,
  authDomain: "cpentrepreneurs-e2e22.firebaseapp.com",
  databaseURL: "https://cpentrepreneurs-e2e22.firebaseio.com",
  projectId: "cpentrepreneurs-e2e22",
  storageBucket: "cpentrepreneurs-e2e22.appspot.com",
  messagingSenderId: "262626193290",
  appId: "1:262626193290:web:ff81c5eff6993b06"
});

export const db = firebase.firestore();
export const auth = firebase.auth();
