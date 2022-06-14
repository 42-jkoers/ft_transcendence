<template>
  <div>
    <Button @click="tempRequest1">user 1 send request to user 2</Button>
  </div>
  <div>
    <Button @click="tempRequest2">user 2 send request to user 1</Button>
  </div>
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
      <Column
        field="username"
        header="Pending Request"
        headerStyle="width: 30%"
      ></Column>
      <Column header="Action" headerStyle="width: 70%">
        <template #body="slotProps">
          <div>
            <span class="p-buttonset">
              <Button
                label="Approve"
                class="p-button-success p-button-sm"
                icon="pi pi-check"
                iconPos="left"
                style="width: 30%"
                @click="addFriend(slotProps.data.id)"
              />
              <Button
                label="Reject"
                class="p-button-danger p-button-sm"
                icon="pi pi-times"
                iconPos="left"
                style="width: 30%"
                @click="rejectRequest(slotProps.data.id)"
              />
            </span>
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, inject } from "vue";
import { Socket } from "socket.io-client";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Message from "primevue/message";
import Column from "primevue/column";
import axios from "axios";
import storeUser from "@/store";
import EditFriend from "@/types/EditFriend";

const socket: Socket = inject("socketioInstance");
const requests = ref([]);
const showSuccessMessage = ref<boolean>(false);
const showFailMessage = ref<boolean>(false);
const successMessage = ref<string>();
onMounted(() => {
  refreshFriendRequests();
});

async function tempRequest1() {
  socket.emit("tempFriendRequest1");
}
async function tempRequest2() {
  socket.emit("tempFriendRequest2");
}

function refreshFriendRequests() {
  setTimeout(() => {
    socket.emit("getFriendRequests");
  }, 100); // FIXME: find a better solution?
  socket.on("getFriendRequests", (response) => {
    requests.value = response;
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

async function addFriend(friendId: number) {
  const postBody = {
    userId: storeUser.state.user.id,
    friendId: friendId,
    action: EditFriend.ADD_FRIEND,
  };
  await axios
    .post("http://localhost:3000/user/edit-friend", postBody, {
      withCredentials: true,
    })
    .then((response) => {
      refreshFriendRequests();
      displaySuccessMessage("Successfully add friend: " + response.data);
    })
    .catch(() => {
      displayErrorMessage();
    });
}

async function rejectRequest(friendId: number) {
  const postBody = {
    userId: storeUser.state.user.id,
    friendId: friendId,
    action: EditFriend.REJECT_REQUEST,
  };
  await axios
    .post("http://localhost:3000/user/edit-friend", postBody, {
      withCredentials: true,
    })
    .then((response) => {
      refreshFriendRequests();
      displaySuccessMessage("Reject request from: " + response.data);
    })
    .catch(() => {
      displayErrorMessage();
    });
}
</script>
