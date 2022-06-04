<template>
  <div id="chatrooms-list">
    <Dialog
      header="Password required"
      v-model:visible="displayPasswordDialog"
      closeOnEscape
      :style="{ width: '50vw' }"
      :closable="false"
    >
      <div class="field p-fluid">
        <small v-if="matchingPasswordError" id="password-help" class="p-error"
          >Entered password is incorrect.</small
        >
        <small v-else id="password-help"
          >Enter room password to join '{{ selectedRoomName }}'</small
        >
        <Password
          id="password"
          v-model="passwordValue"
          :feedback="false"
          showIcon="pi pi-eye"
          toggleMask
        />
      </div>
      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="closePasswordDialog"
          class="p-button-text"
        />
        <Button
          label="OK"
          icon="pi pi-check"
          @click="validatePassword"
          autofocus
        />
      </template>
    </Dialog>
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
              v-if="slotProps.data.password !== null"
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
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, defineEmits } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Socket } from "socket.io-client";
import RoomVisibility from "@/types/RoomVisibility";

import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Dialog from "primevue/dialog";
import Password from "primevue/password";
import Button from "primevue/button";

const socket: Socket = inject("socketioInstance");

const rooms = ref();
onMounted(() => {
  setTimeout(() => {
    socket.emit("getUserRoomsList");
  }, 90); // FIXME: find a better solution?
  socket.on("getUserRoomsList", (response) => {
    rooms.value = response;
  });
});

const router = useRouter();
const route = useRoute();
const displayPasswordDialog = ref(false);
const selectedRoomName = ref(null);
const selectedRoomIcon = ref(null);
const onRowSelect = (event) => {
  if (event.data.password !== null) {
    displayPasswordDialog.value = true;
    selectedRoomName.value = event.data.name;
    selectedRoomIcon.value = event.data.password
      ? event.data.password
      : event.data.visibility;
  } else {
    router.push({ name: "ChatBox", params: { roomName: event.data.name } });
  }
};

const passwordValue = ref();
const closePasswordDialog = () => {
  displayPasswordDialog.value = false;
  passwordValue.value = null;
  matchingPasswordError.value = false;
};

const matchingPasswordError = ref(false);
const validatePassword = () => {
  socket.emit("checkRoomPasswordMatch", {
    name: selectedRoomName.value,
    password: passwordValue.value,
  });
  socket.on("isRoomPasswordMatched", (isMatched) => {
    if (isMatched) {
      closePasswordDialog();
      router.push({
        name: "ChatBox",
        params: { roomName: selectedRoomName.value },
      });
    } else {
      matchingPasswordError.value = true;
    }
  });
};
</script>
