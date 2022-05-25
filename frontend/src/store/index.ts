import router from "@/router";
import axios from "axios";
import { createStore } from "vuex";

const storeUser = createStore({
  state: {
    isAuthenticated: false,
    username: "",
  },
  mutations: {
    updateUserName(state, name) {
      state.username = name;
      console.log(">> updated state username as: ", state.username);
    },
    login(state) {
      axios
        .get("http://localhost:3000/auth/status", {
          withCredentials: true,
        })
        .then((response) => {
          state.isAuthenticated = true;
          if (!response.data.username) {
            router.push({ name: "Register" });
          } else {
            state.username = response.data.username;
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
