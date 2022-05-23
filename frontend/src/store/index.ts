import { createStore } from "vuex";

const store = createStore({
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
      state.isAuthenticated = true;
    },
    logout(state) {
      state.isAuthenticated = false;
    },
  },
});

export default store;
