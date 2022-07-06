<template>
  <div>
    <DataTable :value="gameList" responsiveLayout="scroll">
      <template #header>
        <div class="flex justify-content-center align-items-center">
          <h3>Ongoing Games</h3>
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
            v-tooltip.right="'Visit this game'"
            @click="watchGame(slotProps.data.id)"
          />
          <Button
            class="p-button-rounded p-button-danger"
            icon="pi pi-times"
            v-tooltip.right="'For Testing: Delete this game'"
            @click="deleteGame(slotProps.data.id)"
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
import { useRouter } from "vue-router";
import { Socket } from "socket.io-client";

const socket: Socket = inject("socketioInstance") as Socket;
const router = useRouter();
const gameList = ref();

setTimeout(() => {
  socket.emit("getGameList");
}, 100);

socket.on("getGameList", (response) => {
  gameList.value = response;
});

function watchGame(gameId: number) {
  // TODO: fix issue of no connection without refresh
  router.push({
    name: "Play",
    params: { id: gameId },
  });
}

// TODO: to delete
function deleteGame(gameId: number) {
  socket.emit("tempDeleteGame", gameId);
}
</script>
