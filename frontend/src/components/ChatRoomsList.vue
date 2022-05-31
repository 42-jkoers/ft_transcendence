<template>
  <div id="chatrooms-list">
    <DataTable
      :value="rooms"
      responsiveLayout="scroll"
      :scrollable="true"
      scrollHeight="400px"
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
import Button from "primevue/button";

const socket: Socket = inject("socketioInstance");

onMounted(() => {
  socket.emit("getUserRoomsList");
  socket.on("getUserRoomsList", (response) => {
    console.log("Rooms of current user coming from DB: ", response);
    rooms.value = response;
  });
});

const rooms = ref();
</script>
