<template>
  <div>
    <DataTable
      :value="gameList"
      responsiveLayout="scroll"
      :scrollable="true"
      scrollHeight="60vh"
    >
      <template #header>
        <div class="flex justify-content-center align-items-center">
          <h3>Game List</h3>
        </div>
      </template>
      <Column header="GameName" headerStyle="width: 40%">
        <template #body="slotProps">
          {{ slotProps.data.name }}
        </template>
      </Column>
      <Column header="Watch" headerStyle="width: 10%">
        <template #body="slotProps">
          <Button
            class="p-button-rounded p-button-text p-button-outlined p-button-sm"
            icon="pi pi-eye"
            @click="watchGame(slotProps.data.id)"
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
import { useToast } from "primevue/usetoast";
// import { useRouter } from "vue-router";
import { Socket } from "socket.io-client";

const socket: Socket = inject("socketioInstance");
// const router = useRouter();
const toast = useToast();
const gameList = ref();

setTimeout(() => {
  socket.emit("getGameList");
}, 100);

socket.on("getGameList", (response) => {
  gameList.value = response;
});

function watchGame(gameId: number) {
  // TODO: to add route to game
  console.log(">> you will watch game: ", gameId);
}
</script>
