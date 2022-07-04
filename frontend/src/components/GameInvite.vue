<template>
  <div>
    <DataTable
      :value="receivedInviteList"
      responsiveLayout="scroll"
      :scrollable="true"
      scrollHeight="60vh"
    >
      <template #header>
        <div class="flex justify-content-center align-items-center">
          <h3>Pending Invite List</h3>
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

const socket: Socket = inject("socketioInstance");
const receivedInviteList = ref();

setTimeout(() => {
  socket.emit("getReceivedGameInvites", storeUser.state.user.id);
}, 100);

socket.on("getReceivedGameInvites", (response) => {
  receivedInviteList.value = response;
});

function watchGame(gameId: number) {
  // TODO: to add route to game
  console.log(">> you will watch game: ", gameId);
}
</script>
