<template>
  <div v-if="showFailMessage">
    <Message severity="error" :closable="false">
      Something went wrong, please retry!
    </Message>
  </div>
  <div>
    <DataTable :value="friendList" responsiveLayout="scroll">
      <template #header>
        <div class="flex justify-content-center align-items-center">
          <h3>Friend List</h3>
        </div>
      </template>
      <Column headerStyle="width: 5%">
        <template #header>
          <Button
            icon="pi pi-refresh"
            class="p-button-rounded p-button-text p-button-outlined p-button-sm"
            @click="refreshFriendList"
          />
        </template>
      </Column>
      <Column header="Friends" headerStyle="width: 45%">
        <template #body="slotProps">
          <Chip
            :label="slotProps.data.username"
            :image="slotProps.data.avatar"
          />
        </template>
      </Column>
      <Column header="Action" headerStyle="width: 50%">
        <template #body="slotProps">
          <div class="flex align-items-center flex-column sm:flex-row">
            <Button
              icon="pi pi-envelope"
              class="p-button-rounded p-button-outlined"
            />
            <Button
              icon="pi pi-discord"
              class="p-button-rounded p-button-outlined"
            />
            <EditFriendButton
              :friendId="slotProps.data.id"
              buttonIcon="pi pi-user-minus"
              :action="EditFriend.REMOVE_FRIEND"
              @processed="refreshFriendList"
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
import axios from "axios";
import storeUser from "@/store";
import EditFriend from "@/types/EditFriend";
import EditFriendButton from "./EditFriendButton.vue";

const friendList = ref([]);
const showFailMessage = ref<boolean>(false);
onMounted(async () => {
  await refreshFriendList();
});

async function refreshFriendList() {
  await axios
    .get(
      "http://localhost:3000/user/friend-list?id=" + storeUser.state.user.id,
      {
        withCredentials: true,
      }
    )
    .then((response) => {
      friendList.value = response.data;
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
