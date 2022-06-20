<template>
  <p class="message">This is the game page</p>
</template>

<script setup lang="ts">
import { inject, onMounted } from "vue";
import { Socket } from "socket.io-client";
const socket: Socket = inject("socketioInstance");
onMounted(() => {
  socket.emit("gameStarted");
});
</script>
