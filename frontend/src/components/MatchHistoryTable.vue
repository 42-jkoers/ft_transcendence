<template>
  <div>
    <DataTable
      :value="MatchHistory"
      responsiveLayout="scroll"
      :paginator="true"
      :rows="10"
    >
      <template #header>Match History</template>
      <!-- turn on the scroll mode "responsiveLayout" -->
      <!-- we also need pagination -->
      <Column field="player1" header="Player1"></Column>
      <Column field="player2" header="Player2"></Column>
      <Column field="score" header="Score"></Column>
      <Column field="result" header="Result"></Column>
      <Column field="date" header="Date"></Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { watch, inject, ref, computed, onMounted } from "vue";
import UserProfileI from "@/types/UserProfile.interface";

const user = ref<UserProfileI>();
// const socket: Socket = inject("socketioInstance");

// onMounted(async () => {
//   await findUser();
//   console.log("enter into the route matchhistory with id", id);
//   console.log("user name", user.value?.username);
// });
</script>
