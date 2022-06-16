<template>
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
              @isActionSuccess="catchEvent($event)"
            />
            <EditFriendButton
              :friendId="slotProps.data.id"
              buttonIcon="pi pi-times"
              :action="EditFriendActionType.REJECT_REQUEST"
              @isActionSuccess="catchEvent($event)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import { onMounted, ref, defineEmits } from "vue";
import Button from "primevue/button";
import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Chip from "primevue/chip";
import Badge from "primevue/badge";
import axios from "axios";
import storeUser from "@/store";
import EditFriendActionType from "@/types/EditFriendActionType";
import EditFriendButton from "./EditFriendButton.vue";

const requests = ref([]);
const emit = defineEmits<{
  (event: "error"): boolean;
}>();

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
      emit("error", true);
    });
}

function catchEvent(event) {
  if (event) {
    refreshFriendRequests();
  }
}
</script>
