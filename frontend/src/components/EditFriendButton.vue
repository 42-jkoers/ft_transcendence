<template>
  <Button
    class="p-button-rounded p-button-text p-button-outlined"
    :label="props.buttonLabel"
    :icon="props.buttonIcon"
    @click="editFriend(props.friendId, props.action)"
  />
  <div v-if="showSuccessMessage">
    <Message severity="success" :closable="false">
      {{ successMessage }}
    </Message>
  </div>
  <div v-if="showFailMessage">
    <Message severity="error" :closable="false">
      Something went wrong, please retry!
    </Message>
  </div>
</template>
<script setup lang="ts">
import { defineEmits, ref, defineProps } from "vue";
import Button from "primevue/button";
import Message from "primevue/message";
import axios from "axios";
import storeUser from "@/store";

const showSuccessMessage = ref<boolean>(false);
const showFailMessage = ref<boolean>(false);
const successMessage = ref<string>();

const props = defineProps({
  friendId: Number,
  buttonLabel: String,
  buttonIcon: String,
  action: Number,
});

const emit = defineEmits<{
  (event: "processed"): boolean;
}>();

function displaySuccessMessage(message: string) {
  successMessage.value = message;
  showSuccessMessage.value = true;
  setTimeout(() => (showSuccessMessage.value = false), 2000);
}

function displayErrorMessage() {
  showFailMessage.value = true;
  setTimeout(() => (showFailMessage.value = false), 2000);
}

async function editFriend(
  friendId: number | undefined,
  action: number | undefined
) {
  const postBody = {
    userId: storeUser.state.user.id,
    friendId: friendId,
    action: action,
  };
  await axios
    .post("http://localhost:3000/user/edit-friend", postBody, {
      withCredentials: true,
    })
    .then(async () => {
      displaySuccessMessage("Action processed.");
      setTimeout(() => {
        emit("processed", true);
      }, 2000);
    })
    .catch(() => {
      displayErrorMessage();
    });
}
</script>
