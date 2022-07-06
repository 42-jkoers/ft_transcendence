<template>
  <div>
    <router-link class="title" style="text-decoration: none" to="/">
      PONG
    </router-link>
    <div v-if="isUserLogIn">
      <HomeMenu />
    </div>
    <div><Toast /></div>
    <div><ConfirmDialog /></div>
  </div>
</template>
<script setup lang="ts">
import HomeMenu from "@/components/HomeMenu.vue";
import storeUser from "@/store";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import { computed, inject } from "vue";
import { useRouter } from "vue-router";
import { Socket } from "socket.io-client";
import { useConfirm } from "primevue/useconfirm";

const confirm = useConfirm();
const socket: Socket = inject("socketioInstance") as Socket;
const router = useRouter();
const isUserLogIn = computed(() => {
  return storeUser.state.isAuthenticated;
});

socket.on("readyToStartGame", (username, gameId) => {
  confirm.require({
    message: "Start game with " + username + " now?",
    header: "Confirmation",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      router.push({
        name: "Play",
        params: { id: gameId },
      });
    },
  });
});
</script>
<style scoped>
.title {
  font-size: xx-large;
  font-weight: 600;
}
</style>
