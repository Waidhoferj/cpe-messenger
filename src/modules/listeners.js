import store from "@/store";
import router from "@/router";
export function attachListeners(db, auth) {
  //Track conversation updates
  db.collection("conversations")
    .where("unread", "==", true)
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        console.log("saw a change: ", change.type, change.doc.data());
        store.commit("updateConversations", change.doc.data());
      });
    });
  // control auth flow
  auth.onAuthStateChanged(function(user) {
    if (user) {
      console.log("listener passes user", user);
    } else {
      router.push("/");
    }
  });
}
