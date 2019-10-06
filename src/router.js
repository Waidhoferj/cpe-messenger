import Vue from "vue";
import Router from "vue-router";
import Login from "./views/Login.vue";

Vue.use(Router);

export default new Router({
  mode: "history",
  base: process.env.BASE_URL,
  routes: [
    {
      path: "/",
      name: "login",
      component: Login
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
    }
  ]
});
