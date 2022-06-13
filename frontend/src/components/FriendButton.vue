<template>
  <div v-if="isFriend">
    <Button label="Unfriend" icon="pi pi-user-minus" @click="editFriend" />
  </div>
  <div v-else>
    <Button label="Add Friend" icon="pi pi-user-plus" @click="editFriend" />
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
import { ref, defineEmits, defineProps, inject } from "vue";
import storeUser from "@/store";
import axios from "axios";
import { Socket } from "socket.io-client";

const socket: Socket = inject("socketioInstance");

const props = defineProps({
  friendId: Number,
  isFriend: Boolean,
});

const emit = defineEmits<{
  (event: "isFriend"): boolean;
}>();

const isFriend = ref<boolean>(props.isFriend);
const showSuccessMessage = ref<boolean>(false);
const showFailMessage = ref<boolean>(false);
const successMessage = ref<string>();

function processError() {
  showFailMessage.value = true;
  setTimeout(() => (showFailMessage.value = false), 2000);
}

async function editFriend() {
  const postBody = {
    userId: storeUser.state.user.id,
    friendId: props.friendId,
  };
  try {
    socket.emit("createFriendRequest", props.friendId);
    socket.emit("getFriendRequests");
    socket.on("getFriendRequests", (response) => {
      console.log("socket response: ", response);
    });

    await axios
      .post("http://localhost:3000/user/edit-friend", postBody, {
        withCredentials: true,
      })
      .then((response) => {
        isFriend.value = response.data.isFriend;
        if (isFriend.value) {
          successMessage.value = "Add friend successful.";
        } else {
          successMessage.value = "Remove friend successful.";
        }
        emit("isFriend", isFriend.value);
        showSuccessMessage.value = true;
        setTimeout(() => (showSuccessMessage.value = false), 2000);
      });
  } catch (error) {
    processError();
  }
}
</script>
