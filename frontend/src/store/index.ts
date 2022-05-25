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
    },
  },
  mutations: {
    updateUserName(state, name) {
      state.user.username = name;
      console.log(">> updated state username as: ", state.user.username);
    },
    login(state) {
      if (state.isAuthenticated === true) {
        return;
      }
      axios
        .get("http://localhost:3000/auth/status", {
          withCredentials: true,
        })
        .then((response) => {
          state.isAuthenticated = true;
          if (!response.data.username) {
            router.push({ name: "Register" });
          } else {
            state.user.id = response.data.id;
            state.user.username = response.data.username;
            state.user.avatar = response.data.avatar;
          }
        })
        .catch(() => {
          router.push({ name: "Home" });
        });
    },
    logout(state) {
      state.isAuthenticated = false;
    },
  },
});

export default storeUser;
