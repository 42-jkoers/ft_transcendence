<template>
  <div>
    <Message v-if="showSuccessMessage" severity="success" :closable="false">
      {{ successMessage }}
    </Message>
    <Message v-if="showFailMessage" severity="error" :closable="false">
      Something went wrong, please retry!
    </Message>
  </div>
  <div>
    <Button
      class="p-button-rounded p-button-text p-button-outlined"
      :label="props.buttonLabel"
      :icon="props.buttonIcon"
      @click="editFriend(props.friendId, props.action)"
    />
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, defineProps } from "vue";
import Button from "primevue/button";
import Message from "primevue/message";
import axios from "axios";
import storeUser from "@/store";

const requests = ref([]);
const showSuccessMessage = ref<boolean>(false);
const showFailMessage = ref<boolean>(false);
const successMessage = ref<string>();

const props = defineProps({
  friendId: Number,
  buttonLabel: String,
  buttonIcon: String,
  action: Number,
});

onMounted(async () => {
  await refreshFriendRequests();
});

async function refreshFriendRequests() {
  await axios
    .get(
      "http://localhost:3000/user/friend-request?id=" + storeUser.state.user.id,
      {
        withCredentials: true,
      }
    )
    .then((response) => {
      requests.value = response.data;
    })
    .catch(() => {
      displayErrorMessage();
    });
}

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
    .then(async (response) => {
      await refreshFriendRequests();
      displaySuccessMessage("Successfully processed friend: " + response.data);
    })
    .catch(() => {
      displayErrorMessage();
    });
}
</script>
