<template>
  <Dialog
    :visible="isDialogVisible"
    :style="{ width: '50vw' }"
    @update:visible="handleClose"
  >
    <DataTable
      :value="userList"
      responsiveLayout="scroll"
      :scrollable="true"
      scrollHeight="60vh"
      :row-hover="true"
      dataKey="id"
    >
      <Column field="username" header="Users"> </Column>
    </DataTable>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps, inject } from "vue";
import { Socket } from "socket.io-client";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const socket: Socket = inject("socketioInstance");
const props = defineProps(["isDialogVisible"]);
const emit = defineEmits(["update:isDialogVisible"]);
const userList = ref();

socket.emit("getNonMemberUsers");
socket.on("getNonMemberUsers", (response) => {
  userList.value = response;
});

const handleClose = () => {
  emit("update:isDialogVisible", false);
};
</script>
