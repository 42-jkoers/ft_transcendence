<template>
  <div>
    <DataTable :value="blockedUsers" responsiveLayout="scroll">
      <template #header>
        <div class="flex justify-content-center align-items-center">
          <h3>Blocked users</h3>
        </div>
      </template>
      <Column>
        <template #body="slotProps">
          <Chip
            :label="slotProps.data.username"
            :image="slotProps.data.avatar"
          />
        </template>
      </Column>
      <Column headerStyle="width: 20%">
        <template #body="slotProps">
          <div class="flex align-items-center flex-column sm:flex-row">
            <Button
              v-tooltip.top="'Unblock'"
              class="p-button-rounded p-button-text p-button-outlined"
              icon="pi pi-user-minus"
              @click="unblockUser(slotProps.data.id)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>
<script setup lang="ts">
import { inject, ref } from "vue";
import { Socket } from "socket.io-client";

import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Chip from "primevue/chip";
import Button from "primevue/button";

import { useToast } from "primevue/usetoast";
// const toast = useToast();

const socket: Socket | undefined = inject("socketioInstance");

setTimeout(() => {
  socket?.emit("getBlockedList");
}, 120);

const blockedUsers = ref();
socket?.on("postBlockedList", (blockedList) => {
  blockedUsers.value = blockedList;
});

const unblockUser = (userId: number) => {
  socket?.emit("UnblockUser", userId);
};
</script>
