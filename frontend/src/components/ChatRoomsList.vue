<template>
  <div id="chatrooms-list">
    <ChatRoomPasswordDialogue
      :isDialogVisible="displayPasswordDialog"
      :roomName="selectedRoomName"
      @update:isDialogVisible="displayPasswordDialog = $event"
    />
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
              v-if="slotProps.data.protected"
              class="pi pi-shield"
              style="font-size: 0.8rem"
            ></i>
            <i
              v-else-if="slotProps.data.visibility === RoomVisibility.PRIVATE"
              class="pi pi-lock"
              style="font-size: 0.8rem"
            ></i>
            <i v-else class="pi pi-hashtag" style="font-size: 0.8rem"></i>
          </div>
        </template>
      </Column>
      <Column
        field="name"
        bodyStyle="padding:0"
        header="Chat Rooms"
        headerStyle="padding-left:0"
      ></Column>
      <Column field="joined" style="max-width: 2.5rem">
        <template #body="slotProps">
          <div>
            <i
              v-if="slotProps.data.userRole !== undefined"
              class="pi pi-user"
              style="font-size: 0.8rem"
            ></i>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Socket } from "socket.io-client";
import RoomVisibility from "@/types/RoomVisibility";
import ChatRoomPasswordDialogue from "./ChatRoomPasswordDialogue.vue";

import DataTable from "primevue/datatable";
import Column from "primevue/column";

const socket: Socket = inject("socketioInstance");

const rooms = ref();
onMounted(() => {
  setTimeout(() => {
    // socket.emit("getUserRoomsList");
    socket.emit("getPublicRoomsList");
  }, 90); // FIXME: find a better solution?
  socket.on("postPublicRoomsList", (response) => {
    // socket.on("getUserRoomsList", (response) => {
    console.log("rooms from server", response);

    rooms.value = response;
  });
});

const router = useRouter();
const route = useRoute();

const displayPasswordDialog = ref(false);

const selectedRoomName = ref("");
// const selectedRoomIcon = ref("pi pi-hashtag");

const onRowSelect = (event) => {
  const room = event.data;
  if (room.protected && room.userRole !== 0) {
    displayPasswordDialog.value = true;
    selectedRoomName.value = room.name;
  } else {
    router.push({
      name: "ChatBox",
      params: { roomName: room.name },
    });
  }
};
</script>
