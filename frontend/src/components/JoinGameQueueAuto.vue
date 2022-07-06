<template>
  <div style="margin-top: 5%">
    <Button
      label="Find A Match"
      class="p-button-rounded"
      v-tooltip.top="'You will be automatically matched by the system.'"
      @click="joinWaitingRoom"
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

function joinWaitingRoom() {
  router.push({ name: "GameWaitingRoom", params: { type: "auto" } });
}
</script>
