<template>
  <div>
    <DataTable :value="gameList" responsiveLayout="scroll">
      <template #header>
        <div class="flex justify-content-center align-items-center">
          <h3>Ongoing Games</h3>
        </div>
      </template>
      <Column header="Game" headerStyle="width: 40%">
        <template #body="slotProps">
          {{ slotProps.data.playerName1 }} vs {{ slotProps.data.playerName2 }}
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
  socket.emit("getOngoingGameList");
}, 100);

socket.on("getOngoingGameList", (response) => {
  gameList.value = response;
});

function watchGame(gameId: number) {
  router.push({
    name: "Play",
    params: { id: gameId },
  });
}
</script>
