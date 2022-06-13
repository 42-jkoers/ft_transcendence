<template>
  <div>
    <DataTable :value="requests" responsiveLayout="scroll">
      <Column
        field="username"
        header="Requested User"
        headerStyle="width: 30%"
      ></Column>
      <Column header="Action" headerStyle="width: 70%">
        <template #body>
          <div>
            <span class="p-buttonset">
              <Button
                label="Approve"
                class="p-button-success"
                icon="pi pi-check"
                iconPos="left"
                style="width: 30%"
              />
              <Button
                label="Reject"
                class="p-button-danger"
                icon="pi pi-times"
                iconPos="left"
                style="width: 30%"
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
import Column from "primevue/column";

const socket: Socket = inject("socketioInstance");
const requests = ref();
onMounted(() => {
  setTimeout(() => {
    socket.emit("getFriendRequests");
  }, 90); // FIXME: find a better solution?
  socket.on("getFriendRequests", (response) => {
    requests.value = response;
  });
});
</script>
