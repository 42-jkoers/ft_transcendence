<template>
  <Button label="Unfriend" icon="pi pi-user-minus" @click="removeFriend" />
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
import { ref, defineEmits, defineProps } from "vue";
import storeUser from "@/store";
import axios from "axios";
import EditFriend from "@/types/EditFriend";

const props = defineProps({
  friendId: Number,
});

const emit = defineEmits<{
  (event: "isFriend"): boolean;
}>();

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

async function removeFriend() {
  try {
    const postBody = {
      userId: storeUser.state.user.id,
      friendId: props.friendId,
      action: EditFriend.REMOVE_FRIEND,
    };
    await axios
      .post("http://localhost:3000/user/edit-friend", postBody, {
        withCredentials: true,
      })
      .then((response) => {
        emit("isFriend", false);
        displaySuccessMessage("Successfully remove friend: " + response.data);
      });
  } catch (error) {
    displayErrorMessage();
  }
}
</script>
