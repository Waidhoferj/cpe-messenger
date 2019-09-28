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
    }
  ]
});
