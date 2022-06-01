<template>
  <div id="chatrooms-list">
    <DataTable
      :value="rooms"
      stripedRows
      responsiveLayout="scroll"
      :scrollable="true"
      scrollHeight="400px"
      :row-hover="true"
      v-model:selection="selectedRooms"
      selectionMode="single"
      dataKey="id"
      @rowSelect="onRowSelect"
    >
      <Column field="name" header="Chat Rooms"></Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue";
import { Socket } from "socket.io-client";

import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useRouter, useRoute } from "vue-router";

const socket: Socket = inject("socketioInstance");

const rooms = ref();
onMounted(() => {
  socket.emit("getUserRoomsList");
  socket.on("getUserRoomsList", (response) => {
    console.log("Rooms of current user coming from DB: ", response);
    rooms.value = response;
  });
});
const selectedRooms = ref();

const router = useRouter();
const route = useRoute();
const onRowSelect = (event) => {
  const selectedRoomName: string = event.data.name;
  route.params.roomName = event.data.name;
  router.push({ name: "ChatBox", params: { selectedRoomName } });
};
</script>
