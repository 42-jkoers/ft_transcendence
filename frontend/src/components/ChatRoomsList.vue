<template>
  <div id="chatrooms-list">
    <DataTable
      :value="rooms"
      responsiveLayout="scroll"
      :scrollable="true"
      scrollHeight="60vh"
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
import storeUser from "@/store";
import { Socket } from "socket.io-client";
import { useRouter, useRoute } from "vue-router";

import DataTable from "primevue/datatable";
import Column from "primevue/column";

const socket: Socket = inject("socketioInstance");

const rooms = ref();
onMounted(() => {
  console.log("socket", socket);

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
  const selectedRoomName = event.data.name;
  route.params.roomName = event.data.name;
  router.push({ name: "ChatBox", params: { selectedRoomName } });
  storeUser.commit("updateActiveRoomName", event.data.name);
};
</script>
