import store from "@/store";
import router from "@/router";
export function attachListeners(db) {
  //Track conversation updates
  db.collection("conversations").onSnapshot(snapshot => {
    snapshot.docChanges().forEach(change => {
      if (change.type == "removed") return;
      store.commit("updateConversations", change.doc.data());
    });
  });

  //Track unsent announcements
  db.collection("announcements")
    .where("sent", "==", false)
    .onSnapshot(snapshot => {
      snapshot.docChanges().forEach(change => {
        store.commit("updateQueue", {
          operation: change.type,
          data: change.doc.data()
        });
      });
    });

  if (window.Notification && Notification.permission !== "granted") {
    Notification.requestPermission().then(status => {
      if (Notification.permission !== status) {
        Notification.permission = status;
      }
    });
  }
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
