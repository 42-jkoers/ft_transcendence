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
    <DataTable :value="requests" responsiveLayout="scroll">
      <template #header>
        <div class="flex justify-content-center align-items-center"></div>
      </template>
      <Column header="Pending Request" headerStyle="width: 40%">
        <template #body="slotProps">
          <Chip
            :label="slotProps.data.username"
            :image="slotProps.data.avatar"
          />
        </template>
      </Column>
      <Column header="Action" headerStyle="width: 60%">
        <template #body="slotProps">
          <div>
            <span align="middle">
              <EditFriendButton
                :friendId="slotProps.data.id"
                buttonLabel="Approve"
                buttonIcon="pi pi-check"
                :action="EditFriend.ADD_FRIEND"
              />
              <EditFriendButton
                :friendId="slotProps.data.id"
                buttonLabel="Reject"
                buttonIcon="pi pi-times"
                :action="EditFriend.REJECT_REQUEST"
              />
            </span>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
  <div>
    <br />
    <Button class="p-button-sm" @click="tempRequest1"
      >Test: user 1 send request to user 2</Button
    >
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref } from "vue";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Message from "primevue/message";
import Column from "primevue/column";
import Chip from "primevue/chip";
import axios from "axios";
import storeUser from "@/store";
import EditFriend from "@/types/EditFriend";
import EditFriendButton from "./EditFriendButton.vue";

const requests = ref([]);
const showSuccessMessage = ref<boolean>(false);
const showFailMessage = ref<boolean>(false);
const successMessage = ref<string>();
onMounted(async () => {
  await refreshFriendRequests();
});

async function tempRequest1() {
  const postBody = {
    userId: 1,
    friendId: 2,
    action: EditFriend.SEND_REQUEST,
  };
  await axios
    .post("http://localhost:3000/user/edit-friend", postBody, {
      withCredentials: true,
    })
    .then(async () => {
      await refreshFriendRequests();
    })
    .catch((error) => {
      console.log("catch: ", error);
      displayErrorMessage();
    });
}

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

function displayErrorMessage() {
  showFailMessage.value = true;
  setTimeout(() => (showFailMessage.value = false), 2000);
}
</script>
