<template>
  <div id="chatrooms-list">
    <DataTable
      :value="rooms"
      :paginator="true"
      :rows="10"
      paginatorTemplate="CurrentPageReport FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink RowsPerPageDropdown"
      :rowsPerPageOptions="[10, 20, 50]"
      responsiveLayout="scroll"
      currentPageReportTemplate="Showing {first} to {last} of {totalRecords}"
    >
      <Column field="name" header="Chat Rooms"></Column>
      <template #paginatorstart>
        <Button type="button" icon="pi pi-refresh" class="p-button-text" />
      </template>
      <template #paginatorend>
        <Button type="button" icon="pi pi-cloud" class="p-button-text" />
      </template>
    </DataTable>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue";
import { Socket } from "socket.io-client";

import DataTable from "primevue/datatable";
import Column from "primevue/column";
import Button from "primevue/button";

const socket: Socket = inject("socketioInstance");

onMounted(() => {
  socket.emit("getUserRoomsList");
  socket.on("getUserRoomsList", (response) => {
    console.log("Rooms of current user coming from DB: ", response);
    rooms.value = response;
  });
});

const rooms = ref();
</script>
