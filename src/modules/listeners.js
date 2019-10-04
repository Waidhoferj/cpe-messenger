import store from "@/store";
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
  // firebase.auth().onAuthStateChanged(function(user) {
  //   if (user) {
  //     console.log("listener passes user", user);
  //   } else {
  //     router.push("/");
  //   }
  // });
}
