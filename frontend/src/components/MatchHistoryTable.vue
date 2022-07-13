<template>
  <div>
    <DataTable
      :value="matchHistory"
      responsiveLayout="scroll"
      :paginator="true"
      :rows="10"
    >
      <template #header>Match History</template>
      <Column header="User" headerStyle="width: 20%">
        <template #body="slotProps">
          <Chip
            :label="slotProps.data.playerEntry[0].player.username"
            :image="slotProps.data.playerEntry[0].player.avatar"
          />
        </template>
      </Column>
      <Column header="Score" headerStyle="width: 20%">
        <template #body="slotProps">
          {{
            slotProps.data.playerEntry[0].score +
            ":" +
            slotProps.data.playerEntry[1].score
          }}
        </template>
      </Column>
      <Column header="Component" headerStyle="width: 20%">
        <template #body="slotProps">
          <Chip
            :label="slotProps.data.playerEntry[1].player.username"
            :image="slotProps.data.playerEntry[1].player.avatar"
          />
        </template>
      </Column>
      <Column header="Result" headerStyle="width: 20%">
        <template #body="slotProps">
          <div v-if="slotProps.data.playerEntry[0].result">
            <Tag class="mr-2" severity="danger" value="LOST"></Tag>
          </div>
          <div v-else>
            <Tag value="WON" class="mr-2" severity="success"></Tag>
          </div>
          <!-- {{ slotProps.data.playerEntry[0].result }} -->
        </template>
      </Column>
      <Column header="Date" headerStyle="width: 20%">
        <template #body="slotProps">
          {{ slotProps.data.updated_at }}
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { inject, ref, computed, onMounted } from "vue";
import { Socket } from "socket.io-client";
import { useRoute } from "vue-router";
import { useToast } from "primevue/usetoast";
import Chip from "primevue/chip";
import Tag from "primevue/tag";

const matchHistory = ref();
const socket: Socket = inject("socketioInstance") as Socket;
const router = useRoute();
const id = computed(() => router.params.id); //this is to get the id passed in as parameter from the router
const toast = useToast();
const i = ref(0);

onMounted(async () => {
  await getMatchHistory();
});

async function getMatchHistory() {
  socket.emit("getMatchHistory", { data: parseInt(id.value[0]) });
  socket.on("getMatchHistory", (response) => {
    if (response) {
      matchHistory.value = response;
    }
  });
}
</script>
