<template>
  <div
    class="flex justify-content-center align-items-center"
    style="margin-top: 20%"
  >
    <div>
      <Button
        label="Join Queue"
        class="p-button-rounded p-button-text p-button-outlined"
        @click="joinQueue"
      ></Button>
    </div>
    <div>
      <Button
        label="Quit Queue"
        class="p-button-rounded p-button-text p-button-outlined"
        @click="quitQueue"
      ></Button>
    </div>
  </div>
</template>
<script setup lang="ts">
import Button from "primevue/button";
import { Socket } from "socket.io-client";
import { useToast } from "primevue/usetoast";
import { inject } from "vue";

const toast = useToast();
const socket: Socket = inject("socketioInstance") as Socket;
// toast.add({
//   severity: "error",
//   summary: "Error",
//   detail: response,
//   life: 2000,
// });

socket.on("joinQueue", () => {
  console.log("joined successfully!");
});

function joinQueue() {
  socket.emit("joinQueue");
}

function quitQueue() {
  socket.emit("quitQueue");
}
</script>
