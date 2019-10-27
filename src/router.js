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
      path: "/",
      name: "login",
      component: Login
    },
    {
      path: "/signUp",
      name: "signUp",
      component: () =>
        import(/* webpackChunkName: "signUp" */ "./views/SignUp.vue")
    },
    {
      path: "/announcement",
      name: "announcement",
      component: () =>
        import(
          /* webpackChunkName: "announcement" */ "./views/Announcement.vue"
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
      path: "/errors",
      name: "errors",
      component: () =>
        import(/* webpackChunkName: "errors" */ "./views/Errors.vue")
    }
  ]
});
//AUTH
// router.beforeEach(checkAuthentication);

function checkAuthentication(to, from, next) {
  console.log("store user", store.state.user);
  let unverified = store.state.user === null;
  if (unverified && to.name !== "login" && to.name !== "signUp") next("/");
  else next();
}

export default router;
