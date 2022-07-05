<template>
  <div>
    <DataTable :value="gameQueue" responsiveLayout="scroll">
      <template #header>
        <div class="flex justify-content-center align-items-center">
          <h3>Players In Queue</h3>
        </div>
      </template>
      <Column header="Player" headerStyle="width: 40%">
        <template #body="slotProps">
          <Chip
            :label="slotProps.data.username"
            :image="slotProps.data.avatar"
          />
        </template>
      </Column>
      <Column header="Action" headerStyle="width: 40%">
        <template #body="slotProps">
          <div>
            <Button
              class="p-button-rounded p-button-text p-button-outlined"
              v-tooltip.top="'Join Player'"
              icon="pi pi-play"
              @click="joinPlayer(slotProps.data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
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
    />
  </div>
</template>
<script setup lang="ts">
import Button from "primevue/button";
import { Socket } from "socket.io-client";
import { useToast } from "primevue/usetoast";
import { ref, inject } from "vue";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Chip from "primevue/chip";
import storeUser from "@/store";
import { useRouter } from "vue-router";

const toast = useToast();
const socket: Socket = inject("socketioInstance") as Socket;
const gameQueue = ref();
// toast.add({
//   severity: "error",
//   summary: "Error",
//   detail: response,
//   life: 2000,
// });

socket.on("joinQueue", () => {
  console.log("joined successfully!");
});

socket.emit("getGameQueue");

setTimeout(() => {
  socket.on("getGameQueue", (response) => {
    gameQueue.value = response.filter((user) => {
      return user.id !== storeUser.state.user.id;
    });
  });
}, 100);

function joinQueue() {
  socket.emit("joinQueue");
}

function quitQueue() {
  socket.emit("quitQueue");
}

function joinPlayer(id: number) {
  console.log("join player: ", id);
}
</script>
