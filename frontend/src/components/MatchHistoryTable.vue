<template>
  <div>
    <DataTable
      :value="matchHistory"
      responsiveLayout="scroll"
      :paginator="true"
      :rows="10"
    >
      <template #header>Match History</template>
      <Column header="Game ID" headerStyle="width: 100px">
        <template #body="slotProps">
          {{ slotProps.data.id }}
        </template>
      </Column>
      <Column header="Player 1" headerStyle="width: 10%">
        <template #body="slotProps">
          {{ slotProps.data.playerEntry[0].player.username }}
        </template>
      </Column>
      <Column header="Avatar" headerStyle="width: 10%">
        <template #body="slotProps">
          <!-- <img src =  -->
          {{ slotProps.data.playerEntry[0].player.avatar }}
          <!-- /> -->
        </template>
      </Column>
      <Column header="Score" headerStyle="width: 10%">
        <template #body="slotProps">
          {{
            slotProps.data.playerEntry[0].score +
            ":" +
            slotProps.data.playerEntry[1].score
          }}
        </template>
      </Column>
      <Column header="Player 2" headerStyle="width: 10%">
        <template #body="slotProps">
          {{ slotProps.data.playerEntry[1].player.username }}
        </template>
      </Column>
      <Column header="Avatar" headerStyle="width: 10%">
        <template #body="slotProps">
          {{ slotProps.data.playerEntry[1].player.avatar }}
        </template>
      </Column>
      <Column header="Result" headerStyle="width: 10%">
        <template #body="slotProps">
          {{ slotProps.data.playerEntry[0].result }}
        </template>
      </Column>
      <Column header="Date" headerStyle="width: 20%">
        <template #body="slotProps">
          {{ slotProps.data.updated_at }}
        </template>
      </Column>
      <!-- 
      <Column field="game_id" header="Game ID"></Column>
      <Column field="player1_avatar" header="Player1 Avatar"></Column>
      <Column field="player1_username" header="Player1 Username"></Column>
      <Column field="score" header="Score"></Column>
      <Column field="player2_avatar" header="Player2 Avatar"></Column>
      <Column field="player2_username" header="Player2 Username"></Column>
      <Column field="result" header="Result"></Column>
      <Column field="game_date" header="Date"></Column> -->
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { watch, inject, ref, computed, onMounted } from "vue";
import { Socket } from "socket.io-client";
import { useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import MatchHistoryI from "@/types/MatchHistory.interface";

// const matchHistory = ref<MatchHistoryI[]>();
const matchHistory = ref();
const socket: Socket = inject("socketioInstance");
const router = useRoute();
const id = computed(() => router.params.id); //this is to get the id passed in as parameter from the router
const toast = useToast();

onMounted(async () => {
  await getMatchHistory();
  console.log("enter into the route matchhistory with id", id);
  console.log("response from backend", matchHistory.value);
});

async function getMatchHistory() {
  socket.emit("getMatchHistory", { data: id.value });
  // socket.emit("getMatchHistory", 3); //TODO for now do it for 3 as the mock data is built on player id 3
  socket.on("getMatchHistory", (response) => {
    console.log("entered into the function");
    if (response) {
      console.log("response for the table", response);
      matchHistory.value = response;
    }
  });
}

// onMounted(async () => {
//   await findUser();
//   console.log("enter into the route matchhistory with id", id);
//   console.log("user name", user.value?.username);
// });
</script>
