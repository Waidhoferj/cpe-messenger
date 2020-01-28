import Vue from "vue";
import store from "@/store";
import Router from "vue-router";
import Login from "./views/Login.vue";

Vue.use(Router);

let router = new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/login",
      name: "login",
      component: Login
    },
    {
      path: "/signup",
      name: "signUp",
      component: () =>
        import(/* webpackChunkName: "signUp" */ "@/views/SignUp.vue")
    },
    {
      path: "/announcements",
      name: "announcements",
      component: () =>
        import(
          /* webpackChunkName: "announcements" */ "./views/Announcements.vue"
        )
    },
    {
      path: "/conversations",
      name: "conversations",
      component: () =>
        import(
          /* webpackChunkName: "conversations" */ "./views/Conversations.vue"
        )
    },
    {
      path: "/groups",
      name: "groups",
      component: () =>
        import(/* webpackChunkName: "groups" */ "./views/Groups.vue")
    },
    {
      path: "*",
      name: "default",
      component: Login
    }
  ]
});
//AUTH
router.beforeEach(checkAuthentication);

function checkAuthentication(to, from, next) {
  let unverified = store.state.user === null;
  let safeLocations = ["login", "signUp"];
  if (unverified && !safeLocations.includes(to.name)) next("/login");
  else next();
}

export default router;
