<template>
  <div>
    <DataTable :value="gameList" responsiveLayout="scroll">
      <template #header>
        <div class="flex justify-content-center align-items-center">
          <h3>Game List</h3>
        </div>
      </template>
      <Column headerStyle="width: 5%">
        <template #header>
          <Button
            icon="pi pi-refresh"
            class="p-button-rounded p-button-text p-button-outlined p-button-sm"
            @click="refreshGameList"
          />
        </template>
      </Column>
      <Column header="GameName" headerStyle="width: 40%">
        <template #body="slotProps">
          {{ slotProps.data.name }}
        </template>
      </Column>
      <Column header="Watch" headerStyle="width: 10%">
        <template #body="slotProps">
          <Button
            class="p-button-rounded p-button-text p-button-outlined"
            icon="pi pi-eye"
            @click="watchGame(slotProps.data.id)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import axios from "axios";
import { onMounted, ref } from "vue";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useToast } from "primevue/usetoast";
import { useRouter } from "vue-router";
import { ErrorType, errorMessage } from "@/types/errorManagement";

const router = useRouter();
const toast = useToast();
const gameList = ref();

onMounted(async () => {
  await refreshGameList();
});

async function refreshGameList() {
  await axios
    .get("http://localhost:3000/game/list", {
      withCredentials: true,
    })
    .then((response) => {
      gameList.value = response.data;
    })
    .catch(() => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: errorMessage(ErrorType.GENERAL),
        life: 3000,
      });
    });
}

function watchGame(gameId: number) {
  // TODO: to add route to game
  console.log(">> you will watch game: ", gameId);
}
</script>
