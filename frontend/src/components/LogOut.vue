<template>
  <br />
  <div v-if="logoutButton">
    <Button
      label="Log Out"
      icon="pi pi-power-off"
      iconPos="left"
      @click="requestLogOut"
    />
  </div>
  <div v-if="request">
    <p class="message">Are you sure you want to log out?</p>
    <span class="p-buttonset">
      <Button
        label="Confirm"
        icon="pi pi-check"
        iconPos="left"
        @click="confirmLogOut"
      />
      <Button
        label="Cancel"
        icon="pi pi-times"
        iconPos="left"
        @click="cancelLogOut"
      />
    </span>
  </div>
  <div v-if="confirm">
    <p class="message">You've successfully logged out.</p>
  </div>
</template>
<script setup lang="ts">
import Button from "primevue/button";
import { ref } from "vue";
import axios from "axios";
import store from "@/store/index";
const logoutButton = ref<boolean>(true);
const request = ref<boolean>(false);
const confirm = ref<boolean>(false);
function requestLogOut() {
  request.value = true;
  logoutButton.value = false;
}

async function confirmLogOut() {
  request.value = false;
  await axios.get("http://localhost:3000/auth/logout", {
    withCredentials: true,
  });
  confirm.value = true;
  store.commit("logout");
}

function cancelLogOut() {
  logoutButton.value = true;
  request.value = false;
}
</script>
<style scoped>
.message {
  color: white;
  font-size: x-large;
  font-weight: 500;
}
</style>
