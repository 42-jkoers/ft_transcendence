<template>
  <h3>
    Waiting to be matched.
    <br />
    Please do not leave this page.
  </h3>
</template>
<script setup lang="ts">
import { Socket } from "socket.io-client";
import { inject, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "primevue/usetoast";

const toast = useToast();
const router = useRouter();
const socket: Socket = inject("socketioInstance") as Socket;

onMounted(() => {
  socket.on("startGame", (response) => {
    router.push({
      name: "Play",
      params: { id: response },
    });
  });
  socket.emit("matchPlayer");
});

socket.on("errorMatchPlayer", (response) => {
  toast.add({
    severity: "error",
    summary: "Error",
    detail: response,
    life: 2000,
  });
});
</script>
