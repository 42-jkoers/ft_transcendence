<template>
  <div v-if="showFailMessage">
    <Message severity="error" :closable="false">
      Something went wrong, please retry!
    </Message>
  </div>
  <div>
    <DataTable :value="requests" responsiveLayout="scroll">
      <template #header>
        <div class="flex justify-content-center align-items-center">
          <Badge
            :value="requests.length"
            severity="warning"
            class="mr-2"
            size="large"
          />
          <h3>Pending Request List</h3>
        </div>
      </template>
      <Column headerStyle="width: 5%">
        <template #header>
          <Button
            icon="pi pi-refresh"
            class="p-button-rounded p-button-text p-button-outlined p-button-sm"
            @click="refreshFriendRequests"
          />
        </template>
      </Column>
      <Column header="Friend Requests" headerStyle="width: 55%">
        <template #body="slotProps">
          <Chip
            :label="slotProps.data.username"
            :image="slotProps.data.avatar"
          />
        </template>
      </Column>
      <Column header="Action" headerStyle="width: 40%">
        <template #body="slotProps">
          <div>
            <EditFriendButton
              :friendId="slotProps.data.id"
              buttonIcon="pi pi-check"
              :action="EditFriendActionType.ADD_FRIEND"
              @processed="refreshFriendRequests"
            />
            <EditFriendButton
              :friendId="slotProps.data.id"
              buttonIcon="pi pi-times"
              :action="EditFriendActionType.REJECT_REQUEST"
              @processed="refreshFriendRequests"
            />
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
import Badge from "primevue/badge";
import axios from "axios";
import storeUser from "@/store";
import EditFriendActionType from "@/types/EditFriendActionType";
import EditFriendButton from "./EditFriendButton.vue";

const requests = ref([]);
const showFailMessage = ref<boolean>(false);
onMounted(async () => {
  await refreshFriendRequests();
});

async function tempRequest1() {
  const postBody = {
    userId: 1,
    friendId: 2,
    action: EditFriendActionType.SEND_REQUEST,
  };
  await axios
    .post("http://localhost:3000/user/edit-friend", postBody, {
      withCredentials: true,
    })
    .then(async () => {
      await refreshFriendRequests();
    })
    .catch(() => {
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
