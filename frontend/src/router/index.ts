import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import RegisterView from "@/views/RegisterView.vue";
import UserSettingView from "@/views/UserSettingView.vue";
import UnAuthorizedView from "@/views/UnAuthorizedView.vue";
import LogOut from "@/components/LogOut.vue";
import UserHomeView from "@/views/UserHomeView.vue";
import ComingSoonView from "@/views/ComingSoonView.vue";
import CreateRoom from "@/views/CreateRoom.vue";
import store from "@/store/index";
import LogInState from "@/components/LogInState.vue";
import axios from "axios";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "LogInState",
    component: LogInState,
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
    name: "Create-chatroom",
    component: CreateRoom,
  },
  {
    path: "/register",
    name: "Register",
    component: RegisterView,
    beforeEnter: () => {
      checkRegisterStatus();
    },
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

/* Only new user (with default empty username is able to enter the register view */
const checkRegisterStatus = async function () {
  await axios
    .get("http://localhost:3000/auth/status", {
      withCredentials: true,
    })
    .then((response) => {
      if (response.data.username) {
        router.push({ name: "LogInState" });
      }
    })
    .catch(() => {
      router.push({ name: "UnAuthorized" });
    });
};

/* Check if the user is logged in */
const checkLogIn = async function () {
  if (!store.state.isAuthenticated) {
    router.push({ name: "LogInState" });
  }
};

router.beforeEach((to) => {
  if (
    to.name !== "Home" &&
    to.name !== "LogInState" &&
    to.name !== "Register" &&
    to.name != "UnAuthorized"
  ) {
    checkLogIn();
  }
});

export default router;
