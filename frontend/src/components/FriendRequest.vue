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
      <Column header="Friend Requests" headerStyle="width: 50%">
        <template #body="slotProps">
          <Chip
            :label="slotProps.data.username"
            :image="slotProps.data.avatar"
          />
        </template>
      </Column>
      <Column header="Profile" headerStyle="width: 10%">
        <template #body="slotProps">
          <Button
            v-tooltip.top="'View profile'"
            icon="pi pi-user"
            class="p-button-rounded p-button-text p-button-outlined"
            @click="viewProfile(slotProps.data.id)"
          />
        </template>
      </Column>
      <Column header="Action" headerStyle="width: 40%">
        <template #body="slotProps">
          <div>
            <EditFriendButton
              v-tooltip.top="'Remove request'"
              :friendId="slotProps.data.id"
              buttonIcon="pi pi-times"
              :action="EditFriendActionType.REJECT_REQUEST"
              @isActionSuccess="catchEvent($event)"
            />
            <EditFriendButton
              v-tooltip.top="'Add friend'"
              :friendId="slotProps.data.id"
              buttonIcon="pi pi-check"
              :action="EditFriendActionType.ADD_FRIEND"
              @isActionSuccess="catchEvent($event)"
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
import Column from "primevue/column";
import Chip from "primevue/chip";
import Badge from "primevue/badge";
import axios from "axios";
import storeUser from "@/store";
import { EditFriendActionType } from "@/types/editFriendAction";
import EditFriendButton from "./EditFriendButton.vue";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/errorManagement";
import { useRouter } from "vue-router";

const router = useRouter();
const toast = useToast();
const requests = ref([]);

onMounted(async () => {
  await refreshFriendRequests();
});

async function refreshFriendRequests() {
  await axios
    .get(
      "http://localhost:3000/friend/friend-request?id=" +
        storeUser.state.user.id,
      {
        withCredentials: true,
      }
    )
    .then((response) => {
      requests.value = response.data;
    })
    .catch(() => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: errorMessage(ErrorType.GENERAL),
        life: 3000,
      });
    });
}

function catchEvent(event) {
  if (event) {
    refreshFriendRequests();
  }
}

function viewProfile(userId: number) {
  router.push({
    name: "UserProfileCard",
    params: { id: userId },
  });
}
</script>
