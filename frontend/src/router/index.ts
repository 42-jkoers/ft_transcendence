import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import UserSettingView from "@/views/UserSettingView.vue";
import UnAuthorizedView from "@/views/UnAuthorizedView.vue";
import TwoFactorAuthView from "@/views/TwoFactorAuthView.vue";
import LogOutView from "@/views/LogOutView.vue";
import UserHomeView from "@/views/UserHomeView.vue";
import ComingSoonView from "@/views/ComingSoonView.vue";
import CreateRoom from "@/views/CreateRoomView.vue";
import ChatView from "@/views/ChatView.vue";
import ChatBox from "@/components/ChatBox.vue";
import UserProfileCard from "@/components/UserProfileCard.vue";
import storeUser from "@/store";
import FriendsView from "@/views/FriendsView.vue";
import BlockedUsersView from "@/views/BlockedUsersView.vue";
import EnableTwoFactorView from "@/views/EnableTwoFactorView.vue";
import GameView from "@/views/GameView.vue";
import PlayView from "@/views/PlayView.vue";
import TurnOnTwoFactorView from "@/views/TurnOnTwoFactorView.vue";
import GameWaitingRoom from "@/components/GameWaitingRoom.vue";

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
  },
  {
    path: "/user/:id",
    name: "UserProfileCard",
    component: UserProfileCard,
  },
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
    path: "/userhome/setting",
    name: "UserSetting",
    component: UserSettingView,
  },
  {
    path: "/userhome/logout",
    name: "LogOut",
    component: LogOutView,
  },
  {
    path: "/friends",
    name: "Friends",
    component: FriendsView,
  },
  {
    path: "/blocked",
    name: "Blocked",
    component: BlockedUsersView,
  },
  {
    path: "/chat/create-chatroom",
    name: "Create-chatroom",
    component: CreateRoom,
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
  {
    path: "/2fAuthenticate",
    name: "2fAuthenticate",
    component: TwoFactorAuthView,
  },
  {
    path: "/turnOnTwoFactor",
    name: "turnOnTwoFactor",
    component: TurnOnTwoFactorView,
  },
  {
    path: "/enableTwoFactor",
    name: "enableTwoFactor",
    component: EnableTwoFactorView,
  },
  {
    path: "/game",
    name: "Game",
    component: GameView,
  },
  {
    path: "/play/:id",
    name: "Play",
    component: PlayView,
  },
  {
    path: "/game-waiting-room",
    name: "GameWaitingRoom",
    component: GameWaitingRoom,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

/* Check if the user is logged in */
const checkLogInState = async function () {
  if (storeUser.state.isAuthenticated === false) {
    await storeUser.dispatch("login");
  }
};

router.beforeEach(async (to) => {
  if (to.name !== "UnAuthorized" && to.name !== "2fAuthenticate") {
    await checkLogInState();
    if (to.name !== "Home" && storeUser.state.isAuthenticated === false) {
      router.push({ name: "Home" });
    }
  }
});

export default router;
