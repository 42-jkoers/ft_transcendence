import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";
import RegisterView from "../views/RegisterView.vue";
import UpdateProfileView from "../views/UpdateProfileView.vue";
import UnAuthorizedView from "../views/UnAuthorizedView.vue";
import LogOut from "../components/LogOut.vue";
import axios from "axios";

/* Check if the user is logged in */
const AuthenticateGuard = function () {
  axios
    .get("http://localhost:3000/auth/status", {
      withCredentials: true,
    })
    .catch((error) => {
      console.log("Oops, you ar enot logged in!!");
      console.log(error);
      router.push("/un-authorized");
    });
};

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/chat",
    name: "Chat",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () =>
      import(/* webpackChunkName: "chat" */ "../views/ChatView.vue"),
    beforeEnter: () => {
      AuthenticateGuard();
    },
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterView,
    beforeEnter: (from, to) => {
      AuthenticateGuard();
      // TODO: to protect against access
    },
  },
  {
    path: "/update-profile",
    name: "UpdateProfile",
    component: UpdateProfileView,
    beforeEnter: () => {
      AuthenticateGuard();
    },
  },
  {
    path: "/logout",
    name: "LogOut",
    component: LogOut,
    beforeEnter: () => {
      AuthenticateGuard();
    },
  },
  {
    path: "/un-authorized",
    name: "UnAuthorized",
    component: UnAuthorizedView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
