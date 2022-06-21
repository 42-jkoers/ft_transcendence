import router from "@/router";
import RoomVisibility from "@/types/RoomVisibility";
import Room from "@/types/Room";
import axios from "axios";
import { createStore } from "vuex";

const storeUser = createStore({
  state: {
    isAuthenticated: false,
    user: {
      id: 0,
      username: "",
      avatar: "",
      twoFactor: false,
    },
    roomsInfo: [],
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
      state.user.twoFactor = update;
    },
    setAuthenticated(state) {
      state.isAuthenticated = true;
    },
    unsetAuthenticated(state) {
      state.isAuthenticated = false;
    },
    updateRoomsList(state, updatedRoomsList) {
      state.roomsInfo = updatedRoomsList;
    },
  },
  actions: {
    async login({ commit }) {
      if (storeUser.getters.isAuthenticated === false) {
        await axios
          .get("http://localhost:3000/auth/status", {
            withCredentials: true,
          })
          .then((response) => {
            commit("setAuthenticated");
            commit("updateId", response.data.id);
            commit("updateUserAvatar", response.data.avatar);
            // commit("updateTwoFactor", response.data.avatar); //TODO: 2F
            if (!response.data.username) {
              router.push({ name: "Register" });
            } else {
              commit("updateUserName", response.data.username);
            }
          })
          .catch(() => {
            console.log("user is not unauthorized");
          });
      }
    },
    logout({ commit }) {
      commit("unsetAuthenticated");
    },
  },
});

export default storeUser;
