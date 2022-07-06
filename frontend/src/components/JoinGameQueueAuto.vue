<template>
  <div style="margin-top: 5%">
    <Button
      label="Find A Match"
      class="p-button-rounded p-button-text p-button-outlined"
      @click="joinWaitingRoom"
    ></Button>
  </div>
  <div style="margin-top: 5%">
    <Button
      label="[Temp] Exit Game"
      class="p-button-rounded p-button-help"
      @click="temp"
    ></Button>
  </div>
</template>
<script setup lang="ts">
import Button from "primevue/button";
import { Socket } from "socket.io-client";
import { inject } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const socket: Socket = inject("socketioInstance") as Socket;

// TODO: to delete
function temp() {
  socket.emit("tempExitGame");
}

function joinWaitingRoom() {
  router.push({ name: "GameWaitingRoom", params: { type: "auto" } });
}
</script>
