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
import { ref, defineEmits } from "vue";
import axios from "axios";
const request = ref<boolean>(false);
const confirm = ref<boolean>(false);
// emit is used to pass value from child component to parent component
const emit = defineEmits<{
  (event: "updateUserName"): boolean;
}>();
function requestLogOut() {
  request.value = true;
}

async function confirmLogOut() {
  request.value = false;
  const response = await axios.get("http://localhost:3000/auth/logout", {
    withCredentials: true,
  });
  confirm.value = true;
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
