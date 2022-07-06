<template>
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
      <Column header="Friends" headerStyle="width: 50%">
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
          <div class="flex align-items-center flex-column sm:flex-row">
            <EditFriendButton
              v-tooltip.top="'Remove friend'"
              :friendId="slotProps.data.id"
              buttonIcon="pi pi-user-minus"
              :action="EditFriendActionType.REMOVE_FRIEND"
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
import axios from "axios";
import storeUser from "@/store";
import { EditFriendActionType } from "@/types/editFriendAction";
import EditFriendButton from "./EditFriendButton.vue";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/errorManagement";
import { useRouter } from "vue-router";

const router = useRouter();
const toast = useToast();
const friendList = ref([]);

onMounted(async () => {
  await refreshFriendList();
});

async function refreshFriendList() {
  await axios
    .get(
      "http://localhost:3000/friend/friend-list?id=" + storeUser.state.user.id,
      {
        withCredentials: true,
      }
    )
    .then((response) => {
      friendList.value = response.data;
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
    refreshFriendList();
  }
}

function viewProfile(userId: number) {
  router.push({
    name: "UserProfileCard",
    params: { id: userId },
  });
}
</script>
