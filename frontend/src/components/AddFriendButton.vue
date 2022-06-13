<template>
  <div>
    <Button label="Add Friend" icon="pi pi-user-plus" @click="addFriend" />
  </div>
  <Message v-if="showSuccessMessage" severity="success" :closable="false">
    {{ successMessage }}
  </Message>
  <Message v-if="showFailMessage" severity="error" :closable="false">
    Something went wrong, please retry!
  </Message>
</template>
<script setup lang="ts">
import Button from "primevue/button";
import Message from "primevue/message";
import { ref, defineProps, inject } from "vue";
import { Socket } from "socket.io-client";

const socket: Socket = inject("socketioInstance");

const props = defineProps({
  friendId: Number,
});

const showSuccessMessage = ref<boolean>(false);
const showFailMessage = ref<boolean>(false);
const successMessage = ref<string>();

function displayErrorMessage() {
  showFailMessage.value = true;
  setTimeout(() => (showFailMessage.value = false), 2000);
}

function displaySuccessMessage(message: string) {
  successMessage.value = message;
  showSuccessMessage.value = true;
  setTimeout(() => (showSuccessMessage.value = false), 2000);
}

async function addFriend() {
  socket.emit("createFriendRequest", props.friendId);
  socket.on("createFriendRequest", (response) => {
    if (response === true) {
      displaySuccessMessage("Friend request sent successfully.");
    } else {
      displayErrorMessage();
    }
  });
}
</script>
