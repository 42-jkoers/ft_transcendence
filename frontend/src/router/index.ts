import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import RegisterView from "@/views/RegisterView.vue";
import UserSettingView from "@/views/UserSettingView.vue";
import UnAuthorizedView from "@/views/UnAuthorizedView.vue";
import LogOut from "@/components/LogOut.vue";
import LogIn from "@/components/LogIn.vue";
import UserHomeView from "@/views/UserHomeView.vue";
import ComingSoonView from "@/views/ComingSoonView.vue";
import axios from "axios";
import CreateRoom from "@/views/CreateRoom.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "LogIn",
    component: LogIn,
  },
  {
    path: "/userhome",
    name: "UserHome",
    component: UserHomeView,
    children: [
      {
        path: "/chat",
        name: "Chat",
        // route level code-splitting
        // this generates a separate chunk (about.[hash].js) for this route
        // which is lazy-loaded when the route is visited.
        component: () =>
          import(/* webpackChunkName: "chat" */ "../views/ChatView.vue"),
      },
      {
        path: "setting",
        name: "UserSetting",
        component: UserSettingView,
      },
      {
        path: "logout",
        name: "LogOut",
        component: LogOut,
      },
    ],
  },
  {
    path: "/chat/create-chatroom",
    name: "create-chatroom",
    component: CreateRoom,
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterView,
  },
  {
    path: "/un-authorized",
    name: "UnAuthorized",
    component: UnAuthorizedView,
  },
  {
    path: "/coming-soon",
    name: "ComingSoon",
    component: ComingSoonView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

/* Check if the user is logged in */
const AuthenticateGuard = function () {
  axios
    .get("http://localhost:3000/auth/status", {
      withCredentials: true,
    })
    .catch((error) => {
      console.log("Oops, you ar enot logged in!!");
      console.log(error);
      router.push({ name: "UnAuthorized" });
    });
};

router.beforeEach((to) => {
  if (to.name !== "LogIn" && to.name !== "home") {
    AuthenticateGuard();
  }
});

export default router;
