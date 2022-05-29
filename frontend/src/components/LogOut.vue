<template>
  <br />
  <div>
    <ConfirmButton
      @confirm="confirmLogOut($event)"
      :buttonLabel="buttonLabel"
      successMessage="You've successfully logged out."
    />
  </div>
  <div v-if="showRedirectMessage">
    <h3>Redirecting back to home...</h3>
  </div>
</template>
<script setup lang="ts">
import ConfirmButton from "@/components/ConfirmButton.vue";
import { ref } from "vue";
import axios from "axios";
import storeUser from "@/store";
import router from "@/router";
const showRedirectMessage = ref<boolean>(false);
const buttonLabel = ref("Log Out");
async function confirmLogOut(e) {
  if (e) {
    await axios.get("http://localhost:3000/auth/logout", {
      withCredentials: true,
    });
    storeUser.commit("logout");
    showRedirectMessage.value = true;
    setTimeout(() => router.push({ name: "Home" }), 2000);
  }
}
</script>
<style scoped></style>
