<template>
  <div>{{ requestList }}</div>
</template>
<script setup lang="ts">
import { onMounted, ref, inject } from "vue";
import { Socket } from "socket.io-client";

const socket: Socket = inject("socketioInstance");
const requestList = ref();
onMounted(() => {
  socket.emit("getFriendRequests");
  socket.on("getFriendRequests", (response) => {
    requestList.value = response;
  });
});
</script>
