<template>
  <form class="form" @submit.prevent="onSubmit">
    <button class="logout-button" @click="requestLogOut">Log out</button>
    <div v-if="request">
      <p class="confirm-question">Are you sure you want to log out?</p>
      <button class="yes-button" @click="confirmLogOut">Confirm</button>
    </div>
    <div v-if="confirm">
      <p class="success-message">You've successfully logged out.</p>
    </div>
  </form>
</template>
<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import store from "@/store/index";
const request = ref<boolean>(false);
const confirm = ref<boolean>(false);
function requestLogOut() {
  request.value = true;
}

async function confirmLogOut() {
  request.value = false;
  await axios.get("http://localhost:3000/auth/logout", {
    withCredentials: true,
  });
  confirm.value = true;
  store.commit("logout");
}
</script>
<style>
.confirm-question {
  color: darkred;
  font-weight: 500;
}
.success-message {
  color: green;
  font-weight: 500;
}
</style>
