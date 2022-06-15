<template>
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
              @isActionSuccess="
                catchEvent($event, EditFriendActionType.ADD_FRIEND)
              "
            />
            <EditFriendButton
              :friendId="slotProps.data.id"
              buttonIcon="pi pi-times"
              :action="EditFriendActionType.REJECT_REQUEST"
              @isActionSuccess="
                catchEvent($event, EditFriendActionType.REJECT_REQUEST)
              "
            />
          </div>
        </template>
      </Column>
    </DataTable>
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
import { friendActionSuccessMessage } from "@/types/editFriend";

const requests = ref([]);
const showSuccessMessage = ref<boolean>(false);
const successMessage = ref<string>();
const showFailMessage = ref<boolean>(false);
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

function displayErrorMessage() {
  showFailMessage.value = true;
  setTimeout(() => (showFailMessage.value = false), 2000);
}

function displaySuccessMessage(message: string) {
  successMessage.value = message;
  showSuccessMessage.value = true;
  setTimeout(() => (showSuccessMessage.value = false), 3000);
}

function catchEvent(event, action: EditFriendActionType) {
  if (event) {
    const message = friendActionSuccessMessage(action);
    displaySuccessMessage(message);
    refreshFriendRequests();
  } else {
    displayErrorMessage();
  }
}
</script>
