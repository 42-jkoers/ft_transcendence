<template>
  <br />
  <div v-if="isVisible">
    <ConfirmDialog></ConfirmDialog>
    <Button
      class="p-button-rounded p-button-text p-button-outlined"
      label="Log Out"
      icon="pi pi-power-off"
      @click="confirmLogOut"
    />
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
import storeUser from "@/store";
import router from "@/router";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import ConfirmDialog from "primevue/confirmdialog";
import Button from "primevue/button";
import { ErrorType, errorMessage } from "@/types/errorManagement";

const confirm = useConfirm();
const toast = useToast();
const isVisible = ref<boolean>(true);

async function confirmLogOut() {
  confirm.require({
    message: "Are you sure you want to log out?",
    header: "Confirmation",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      logOut();
    },
  });
}
async function logOut() {
  await axios
    .get("http://localhost:3000/auth/logout", {
      withCredentials: true,
    })
    .then(() => {
      storeUser.dispatch("logout");
      isVisible.value = false;
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
