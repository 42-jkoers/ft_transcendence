<template>
  <div v-if="matchType == 'auto'">
    <h3>
      Waiting to be matched.
      <br />
      Please do not leave this page.
    </h3>
    <div>
      <Button
        class="p-button-rounded p-button-text p-button-outlined"
        label="Leave Match Making"
        v-tooltip.top="'Once click, you will no long be matched.'"
        icon="pi pi-sign-out"
        @click="leaveRoom()"
      />
    </div>
  </div>
  <div v-if="matchType == 'invite'">
    <h3>
      Waiting for the other player to join.
      <br />
      Please do not leave this page.
    </h3>
  </div>
</template>
<script setup lang="ts">
import { Socket } from "socket.io-client";
import { inject, onMounted, computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import Button from "primevue/button";

const toast = useToast();
const router = useRouter();
const route = useRoute();
const socket: Socket = inject("socketioInstance") as Socket;
const matchType = computed(() => route.params.type);

onMounted(() => {
  socket.on("startGame", (response) => {
    router.push({
      name: "Play",
      params: { id: response },
    });
  });
  if (matchType.value === "auto") {
    socket.emit("matchPlayer");
  }
});

socket.on("errorMatchMaking", (response) => {
  toast.add({
    severity: "error",
    summary: "Error",
    detail: response,
    life: 2000,
  });
  leaveRoom();
});

function leaveRoom() {
  socket.emit("quitQueue");
  router.push({
    name: "Game",
  });
}
</script>
