import router from "@/router";
import axios from "axios";
import { createStore } from "vuex";

const storeUser = createStore({
  state: {
    isAuthenticated: false,
    user: {
      id: 0,
      username: "",
      avatar: "",
      twoFactorEnabled: false,
    },
    roomsInfo: [],
    blockedUsers: [] as { id: number; username: string }[],
  },
  getters: {
    isAuthenticated(state) {
      return state.isAuthenticated;
    },
  },
  mutations: {
    updateId(state, id) {
      state.user.id = id;
    },
    updateUserName(state, name) {
      state.user.username = name;
    },
    updateUserAvatar(state, avatar) {
      state.user.avatar = avatar;
    },
    updateTwoFactor(state, update) {
      state.user.twoFactorEnabled = update;
    },
    setAuthenticated(state) {
      state.isAuthenticated = true;
    },
    unsetAuthenticated(state) {
      state.isAuthenticated = false;
    },
    updateRoomsListInStore(state, updatedRoomsList) {
      state.roomsInfo = updatedRoomsList;
    },
    addBlockedUsersToStore(
      state,
      blockedUser: { id: number; username: string }
    ) {
      state.blockedUsers.push(blockedUser);
    },
    removeBlockedUsersFromStore(
      state,
      blockedUser: { id: number; username: string }
    ) {
      state.blockedUsers.filter((user) => user.id !== blockedUser.id);
    },
  },
  actions: {
    async login({ commit }) {
      if (storeUser.getters.isAuthenticated === false) {
        await axios
          .get("http://localhost:3000/auth/status", {
            withCredentials: true,
          })
          .then(async (response) => {
            console.log(
              "enable?",
              response.data.isTwoFactorAuthEnabled,
              "2f authenticated?",
              response.data.isTwoFactorAuthenticated
            );
            if (
              response.data.isTwoFactorAuthEnabled &&
              !response.data.isTwoFactorAuthenticated
            ) {
              router.push({ name: "2fAuthenticate" });
            } else {
              commit("setAuthenticated");
              commit("updateId", response.data.id);
              commit("updateUserAvatar", response.data.avatar);
              commit("updateTwoFactor", response.data.isTwoFactorAuthEnabled);
              commit("updateUserName", response.data.username);
            }
          })
          .catch(() => {
            console.log("user is not unauthorized");
          });
      }
    },
    async enable2F({ commit }) {
      commit("updateTwoFactor", true);
    },
    logout({ commit }) {
      commit("unsetAuthenticated");
    },
  },
});

export default storeUser;
