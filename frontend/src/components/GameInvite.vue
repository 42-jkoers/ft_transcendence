<template>
  <div>
    <DataTable :value="receivedInviteList" responsiveLayout="scroll">
      <template #header>
        <div class="flex justify-content-center align-items-center">
          <h3>Pending Game Invites</h3>
        </div>
      </template>
      <Column header="Invite from" headerStyle="width: 40%">
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
              v-tooltip.top="'Reject invite'"
              icon="pi pi-times"
              @click="rejectInvite(slotProps.data.id)"
            />
            <Button
              class="p-button-rounded p-button-text p-button-outlined"
              v-tooltip.top="'Play Game'"
              icon="pi pi-check"
              @click="acceptInvite(slotProps.data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import { ref, inject } from "vue";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Chip from "primevue/chip";
import { Socket } from "socket.io-client";
import storeUser from "@/store";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";

const toast = useToast();
const socket: Socket = inject("socketioInstance") as Socket;
const receivedInviteList = ref();
const router = useRouter();

setTimeout(() => {
  socket.emit("getReceivedGameInvites", storeUser.state.user.id);
}, 100);

socket.on("getReceivedGameInvites", (response) => {
  receivedInviteList.value = response;
});

socket.on("errorGameInvite", (response) => {
  toast.add({
    severity: "error",
    summary: "Error",
    detail: response,
    life: 2000,
  });
});

socket.on("startGame", (response) => {
  router.push({
    name: "Play",
    params: { id: response },
  });
});

function rejectInvite(id: number) {
  socket.emit("removeGameInvite", id);
}

function acceptInvite(id: number) {
  socket.emit("acceptGameInvite", id);
  router.push({ name: "GameWaitingRoom" });
}
</script>
