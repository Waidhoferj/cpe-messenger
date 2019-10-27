import store from "@/store";
import router from "@/router";
export function attachListeners(db) {
  //Track conversation updates
  db.collection("conversations")
    .where("unread", "==", true)
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        store.commit("updateConversations", change.doc.data());
      });
    });

  db.collection("functionErrors")
    .where("timestamp", ">", 0)
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        store.commit("updateErrors", change.doc.data());
      });
    });
}

export function trackAuthState(auth) {
  // control auth flow
  auth.onAuthStateChanged(function(user) {
    if (user) {
      store.commit("setUser", user);
    } else {
      router.push("/");
    }
  });
}
