<template>
  <div id="chatrooms-list">
    <DataTable
      :value="rooms"
      class="p-datatable-sm"
      responsiveLayout="scroll"
      :scrollable="true"
      scrollHeight="60vh"
      :row-hover="true"
      :selection="{ name: route.params.roomName }"
      selectionMode="single"
      dataKey="name"
      @rowSelect="onRowSelect"
    >
      <Column field="visibility" style="max-width: 2.5rem">
        <template #body="slotProps">
          <div>
            <i
              v-if="slotProps.data.visibility === RoomVisibility.PUBLIC"
              class="pi pi-hashtag"
              style="font-size: 0.8rem"
            ></i>
            <i
              v-else-if="slotProps.data.visibility === RoomVisibility.PRIVATE"
              class="pi pi-lock"
              style="font-size: 0.8rem"
            ></i>
            <i v-else class="pi pi-shield" style="font-size: 0.8rem"></i>
          </div>
        </template>
      </Column>
      <Column
        field="name"
        bodyStyle="padding:0"
        header="Chat Rooms"
        headerStyle="padding-left:0"
      ></Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Socket } from "socket.io-client";
import RoomVisibility from "@/types/RoomVisibility";

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

const router = useRouter();
const route = useRoute();

const onRowSelect = (event) => {
  router.push({ name: "ChatBox", params: { roomName: event.data.name } });
};
</script>
