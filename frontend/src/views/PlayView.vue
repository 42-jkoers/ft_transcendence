<template>
  <p class="message">This is the play page</p>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import { Socket } from "socket.io-client";
import { useRoute } from "vue-router";

const socket: Socket = inject("socketioInstance");
const route = useRoute();

// socket.on("BadRequestException", (response) => {});

onMounted(async () => {
  console.log("mounted");

  socket.emit("getGame", route.params.id);
  socket.on("getGame", (game) => {
    console.log("got game", game);
  });
});
</script>
