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
      <Column field="username" header="Users"></Column>
      <Column field="isUser">
        <template #body="slotProps">
          <div>
            <p v-if="checkIfUserIsInRoom(slotProps.data.username)">
              already in room
            </p>
          </div>
        </template>
      </Column>
    </DataTable>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, inject } from "vue";
import { Socket } from "socket.io-client";
import { useRoute } from "vue-router";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import { useToast } from "primevue/usetoast";

const socket: Socket = inject("socketioInstance");
const route = useRoute();
const emit = defineEmits(["update:isDialogVisible"]);
const toast = useToast();
const userList = ref();
const roomWithUserRelations = ref();

setTimeout(() => {
  socket.emit(
    "getAllRegisteredUsersExceptYourselfAndAdmin",
    route.params.roomName
  );
}, 90);

socket.on("getAllRegisteredUsersExceptYourselfAndAdmin", (response) => {
  userList.value = response;
});

socket.emit("getOneRoomWithUserToRoomRelations", route.params.roomName);
socket.on("getOneRoomWithUserToRoomRelations", (response) => {
  roomWithUserRelations.value = response;
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
    socket.emit("getOneRoomWithUserToRoomRelations", route.params.roomName);
  }
};

const checkIfUserIsInRoom = (userName: string) => {
  for (var userToRoom of roomWithUserRelations.value.userToRooms)
    if (userToRoom.user.username === userName) return true;
};

const handleClose = () => {
  socket.emit(
    "getAllRegisteredUsersExceptYourselfAndAdmin",
    route.params.roomName
  );
  emit("update:isDialogVisible", false);
};
</script>
