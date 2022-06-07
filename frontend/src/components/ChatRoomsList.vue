<template>
  <div id="chatrooms-list">
    <DataTable
      :value="rooms"
      responsiveLayout="scroll"
      :scrollable="true"
      scrollHeight="60vh"
      :row-hover="true"
      :selection="{ name: route.params.roomName }"
      selectionMode="single"
      dataKey="name"
      @rowSelect="onRowSelect"
    >
      <Column field="name" header="Chat Rooms"></Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue";
import { Socket } from "socket.io-client";
import { useRouter, useRoute } from "vue-router";

import DataTable from "primevue/datatable";
import Column from "primevue/column";

const socket: Socket = inject("socketioInstance");

const rooms = ref();
onMounted(() => {
  setTimeout(() => {
    socket.emit("getUserRoomsList");
  }, 90); // FIXME: find a better solution?
  socket.on("getUserRoomsList", (response) => {
    console.log("Rooms of current user coming from DB: ", response);
    rooms.value = response;
  });
});

const router = useRouter();
const route = useRoute();

const onRowSelect = (event) => {
  router.push({ name: "ChatBox", params: { roomName: event.data.name } });
};
</script>
