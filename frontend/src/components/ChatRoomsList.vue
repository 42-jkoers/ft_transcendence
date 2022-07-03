<template>
  <div v-if="isRoomsListReady" id="chatrooms-list">
    <ChatRoomPasswordDialogue
      :isDialogVisible="displayPasswordDialog"
      :roomName="selectedRoomName"
      @update:isDialogVisible="displayPasswordDialog = $event"
    />
    <ChatRoomEditPrivacyDialogue
      :isDialogVisible="displayEditPrivacyDialog"
      :room="selectedRoom"
      @update:isDialogVisible="displayEditPrivacyDialog = $event"
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
              v-else-if="slotProps.data.isDirectMessage"
              class="pi pi-user"
              style="font-size: 0.8rem"
            ></i>
            <i
              v-else-if="
                slotProps.data.visibility === RoomVisibility.PRIVATE &&
                !slotProps.data.isDirectMessage
              "
              class="pi pi-lock"
              style="font-size: 0.8rem"
            ></i>
            <i v-else class="pi pi-hashtag" style="font-size: 0.8rem"></i>
          </div>
        </template>
      </Column>
      <Column
        field="displayName"
        bodyStyle="padding:0"
        header="Chat Rooms"
        headerStyle="padding-left:0"
      ></Column>
      <Column field="joined" style="max-width: 2.5rem">
        <template #body="slotProps">
          <div>
            <i
              v-if="slotProps.data.userRole !== undefined"
              class="pi pi-check-circle"
              style="font-size: 0.8rem"
            ></i>
          </div>
        </template>
      </Column>
    </DataTable>
    <ContextMenu :model="menuItems" ref="cm" />
  </div>

  <div v-else style="padding-top: 2rem">
    <ProgressSpinner
      class="flex align-items-center justify-content-center"
      style="width: 50px; height: 50px"
      strokeWidth="6"
      animationDuration=".5s"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Socket } from "socket.io-client";
import RoomVisibility from "@/types/RoomVisibility";
import Room from "@/types/Room";
import ChatRoomPasswordDialogue from "./ChatRoomPasswordDialogue.vue";
import ChatRoomEditPrivacyDialogue from "./ChatRoomEditPrivacyDialogue.vue";

import DataTable from "primevue/datatable";
import Column from "primevue/column";
import ContextMenu from "primevue/contextmenu";
import { useConfirm } from "primevue/useconfirm";
import ProgressSpinner from "primevue/progressspinner";
import { UserRole } from "@/types/UserRole.Enum";
import { useStore } from "vuex";

const socket: Socket | undefined = inject("socketioInstance");
const router = useRouter();
const route = useRoute();

const rooms = ref();
socket?.emit("getPublicRoomsList");

const isRoomsListReady = ref<boolean>(false);
const store = useStore();
onMounted(() => {
  if (!isRoomsListReady.value && store.state.roomsInfo.length > 0) {
    rooms.value = store.state.roomsInfo;
    isRoomsListReady.value = true;
  }
});

const updateRoomsListInStore = (roomsList: Room[]) =>
  store.commit("updateRoomsListInStore", roomsList);

socket?.on("postPublicRoomsList", (response) => {
  isRoomsListReady.value = true;
  console.log("rooms from server", response);
  rooms.value = response;
  updateRoomsListInStore(response);
});

socket?.on("room deleted", (deletedRoomName) => {
  if (deletedRoomName === route.params.roomName) {
    router.push({
      name: "Chat",
    });
  }
  socket.emit("getPublicRoomsList");
});

socket?.on("postPrivateChatRoom", (dMRoom) => {
  router.push({
    name: "ChatBox",
    params: { roomName: dMRoom.name },
  });
});

const displayPasswordDialog = ref(false);
const displayEditPrivacyDialog = ref(false);

const selectedRoomName = ref("");

const onRowSelect = (event) => {
  const room = event.data;
  if (room.protected && room.userRole === undefined) {
    displayPasswordDialog.value = true;
    selectedRoomName.value = room.name;
  } else {
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
    // icon: "pi pi-pencil",
    visible: () =>
      selectedRoom.value.visibility === RoomVisibility.PUBLIC &&
      isOwner(selectedRoom.value.userRole),
    command: () => editRoomPrivacy(),
  },
  {
    label: "Leave chat",
    // icon: "pi pi-exclamation-circle",
    visible: () => !isInRoom(selectedRoom.value.userRole),
    disabled: () =>
      selectedRoom.value.name === "general" ||
      selectedRoom.value.isDirectMessage,
    command: () => confirmLeave(selectedRoom),
  },
  {
    label: "Join chat",
    // icon: "pi pi-exclamation-circle",
    visible: () => isInRoom(selectedRoom.value.userRole),
    command: () => socket?.emit("addUserToRoom", selectedRoom.value.name),
  },
]);

const onRowContextMenu = (event) => {
  cm.value.show(event.originalEvent);
};
const isOwner = (userRole: UserRole | undefined) =>
  userRole === 0 ? true : false;
const isInRoom = (userRole: UserRole | undefined) =>
  userRole === undefined ? true : false;

const confirm = useConfirm();

const confirmLeave = (room) => {
  confirm.require({
    message: "Are you sure you want to leave?",
    header: "Leave Confirmation",
    icon: "pi pi-info-circle",
    accept: () => {
      socket?.emit("removeUserFromRoom", room.value.name);
      if (
        route.params.roomName === room.value.name &&
        (room.value.visibility === RoomVisibility.PRIVATE ||
          room.value.protected === true)
      ) {
        router.push({
          name: "Chat",
        });
      }
    },
  });
};

const editRoomPrivacy = () => {
  displayEditPrivacyDialog.value = true;
};
</script>
<style>
@keyframes p-progress-spinner-color {
  100%,
  0% {
    stroke: #efe4e3;
  }
  40% {
    stroke: #8b8d90;
  }
  66% {
    stroke: #fafffd;
  }
  80%,
  90% {
    stroke: #afada9;
  }
}
</style>
