<template>
  <p>Log in successful, redirect to UserHome page.</p>
</template>
<script setup lang="ts">
import router from "@/router";
import store from "@/store/index";
import { onMounted } from "vue";
import axios from "axios";
onMounted(() => {
  axios
    .get("http://localhost:3000/auth/status", {
      withCredentials: true,
    })
    .then((response) => {
      if (!response.data.username) {
        router.push({ name: "Register" });
      } else {
        store.commit("updateUserName", response.data.username);
        store.commit("login");
        router.push({ name: "UserHome" });
      }
    })
    .catch(() => {
      router.push({ name: "UnAuthorized" });
    });
});
</script>
<style></style>
