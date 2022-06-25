<template>
  <Dialog
    :visible="isDialogVisible"
    :style="{ width: '50vw' }"
    @update:visible="handleClose"
  >
    <DataTable
      :value="userList"
      responsiveLayout="scroll"
      :scrollable="true"
      scrollHeight="60vh"
      :row-hover="true"
      dataKey="id"
      @rowClick="onRow"
    >
      <Column field="username" header="Users"> </Column>
    </DataTable>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps, inject, computed } from "vue";
import { Socket } from "socket.io-client";
import { useRoute } from "vue-router";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useToast } from "primevue/usetoast";

const socket: Socket = inject("socketioInstance");
const route = useRoute();
const props = defineProps(["isDialogVisible"]);
const emit = defineEmits(["update:isDialogVisible"]);
const toast = useToast();
const userList = ref();
const roomWithUserRole = ref();

socket.emit(
  "getAllRegisteredUsersExceptYourselfAndAdmin",
  route.params.roomName
);
socket.on("getAllRegisteredUsersExceptYourselfAndAdmin", (response) => {
  userList.value = response;
});

socket.emit("getOneRoomWithUserToRoomRelations", route.params.roomName);
socket.on("getOneRoomWithUserToRoomRelations", (response) => {
  roomWithUserRole.value = response;
});

const onRow = (event) => {
  const user = event.data;
  if (checkIfUserIsInRoom(user.username)) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: "User is already in the room",
      life: 1000,
    });
  } else {
    console.log(`room ${route.params.roomName} user ${user.username} added`);
    socket.emit("userAddsAnotherUserToRoom", {
      userId: user.id,
      roomName: route.params.roomName,
    });
  }
};

const checkIfUserIsInRoom = (userName: string) => {
  for (var userToRoom of roomWithUserRole.value.userToRooms)
    if (userToRoom.user.username === userName) return true;
};

const handleClose = () => {
  emit("update:isDialogVisible", false);
};
</script>
