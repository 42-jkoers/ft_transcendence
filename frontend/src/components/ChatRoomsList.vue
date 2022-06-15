<template>
  <div id="chatrooms-list">
    <ConfirmDialog></ConfirmDialog>
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
      contextMenu
      v-model:contextMenuSelection="selectedRoom"
      @rowContextmenu="onRowContextMenu"
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
    <ContextMenu :model="menuItems" ref="cm" />
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
import ContextMenu from "primevue/contextmenu";
import ConfirmDialog from "primevue/confirmdialog";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

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

const onRowSelect = (event) => {
  const room = event.data;
  if (room.protected && room.userRole !== 0) {
    displayPasswordDialog.value = true;
    selectedRoomName.value = room.name;
  } else {
    socket.emit("addUserToRoom", room.name); // FIXME: temp
    router.push({
      name: "ChatBox",
      params: { roomName: room.name },
    });
  }
};

const cm = ref();
const selectedRoom = ref();
const menuItems = ref([
  {
    label: "Edit privacy",
    icon: "pi pi-pencil",
    visible: () => isOwner(selectedRoom.value.userRole),
    command: () => editRoomPrivacy(selectedRoom),
  },
  {
    label: "Leave",
    icon: "pi pi-exclamation-circle",
    command: () => confirmLeave(selectedRoom),
  },
]);

const onRowContextMenu = (event) => {
  cm.value.show(event.originalEvent);
};
const isOwner = (userRole) => (userRole === 0 ? true : false);

const confirm = useConfirm();
const toast = useToast();

const confirmLeave = (room) => {
  confirm.require({
    message: "Are you sure you want to leave?",
    header: "Leave Confirmation",
    icon: "pi pi-info-circle",
    accept: () => {
      toast.add({
        severity: "info",
        summary: "Confirmed",
        detail: "Record deleted",
        life: 3000,
      });
      if (route.params.roomName === room.value.name) {
        router.push({
          name: "Chat",
        });
      }
      console.log(
        `Let's pretend you've just left the room ${room.value.name}. Check that you're moved to the general room`
      );
    },
    reject: () => {
      toast.add({
        severity: "error",
        summary: "Rejected",
        detail: "You have rejected",
        life: 3000,
      });
    },
  });
};

const editRoomPrivacy = (room) => {
  console.log(
    `Room ${room.value.name}'s visibility is ${room.value.visibility}. Is it protected with a password? ${room.value.protected}`
  );
};
</script>
<style></style>
