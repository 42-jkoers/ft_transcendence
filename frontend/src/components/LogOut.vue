<template>
  <br />
  <div v-if="isVisible">
    <Button
      class="p-button-rounded p-button-text p-button-outlined"
      label="Log Out"
      icon="pi pi-power-off"
      @click="logOut"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, inject } from "vue";
import axios from "axios";
import storeUser from "@/store";
import router from "@/router";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";
import { ErrorType, errorMessage } from "@/types/errorManagement";
import { Socket } from "socket.io-client";

const socket: Socket = inject("socketioInstance") as Socket;
const toast = useToast();
const isVisible = ref<boolean>(true);

async function logOut() {
  await axios
    .get("http://localhost:3000/auth/logout", {
      withCredentials: true,
    })
    .then(() => {
      storeUser.dispatch("logout");
      isVisible.value = false;
      socket.emit("exitUserSocketRoom");
      redirectToHome();
    })
    .catch(() => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: errorMessage(ErrorType.GENERAL),
        life: 3000,
      });
    });
}

function redirectToHome() {
  toast.add({
    severity: "info",
    summary: "Success",
    detail: "Log out successfully. Redirecting to home...",
    life: 3000,
  });
  setTimeout(() => router.push({ name: "Home" }), 1000);
}
</script>
<style scoped></style>
