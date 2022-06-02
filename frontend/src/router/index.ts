import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import RegisterView from "@/views/RegisterView.vue";
import UserSettingView from "@/views/UserSettingView.vue";
import UnAuthorizedView from "@/views/UnAuthorizedView.vue";
import LogOut from "@/components/LogOut.vue";
import UserHomeView from "@/views/UserHomeView.vue";
import ComingSoonView from "@/views/ComingSoonView.vue";
import CreateRoom from "@/views/CreateRoom.vue";
import ChatView from "@/views/ChatView.vue";
import ChatBox from "@/components/ChatBox.vue";
import storeUser from "@/store";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
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
        component: ChatView,
        redirect: { name: "ChatBox", params: { roomName: "general" } },
        children: [
          {
            path: "room/:roomName",
            name: "ChatBox",
            component: ChatBox,
          },
        ],
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
  if (storeUser.state.isAuthenticated) {
    if (storeUser.state.user.username !== "") {
      router.push({ name: "UserHome" });
    }
  } else {
    router.push({ name: "UserHome" });
  }
};

/* Check if the user is logged in */
const checkLogInState = async function () {
  if (storeUser.state.isAuthenticated === false) {
    storeUser.commit("login");
  } else if (storeUser.state.user.username === "") {
    router.push({ name: "Register" });
  }
};

router.beforeEach((to) => {
  if (
    to.name !== "Home" &&
    to.name !== "Register" &&
    to.name != "UnAuthorized"
  ) {
    checkLogInState();
  }
});

export default router;
