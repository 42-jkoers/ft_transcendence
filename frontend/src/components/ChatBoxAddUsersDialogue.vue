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
      @rowClick="onRow"
    >
      <Column field="username" header="Users"> </Column>
    </DataTable>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps, inject } from "vue";
import { Socket } from "socket.io-client";
import { useRoute } from "vue-router";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";
import Column from "primevue/column";

const socket: Socket = inject("socketioInstance");
const route = useRoute();
const props = defineProps(["isDialogVisible"]);
const emit = defineEmits(["update:isDialogVisible"]);
const userList = ref();

socket.emit("getNonMemberUsers", "general");

socket.on("getNonMemberUsers", (response) => {
  userList.value = response;
});

const onRow = (event) => {
  const user = event.data;
  console.log(`room ${route.params.roomName} user ${user.username} added?`);
  socket.emit("userAddsAnotherUserToRoom", {
    userId: user.id,
    roomName: route.params.roomName,
  });
};

const handleClose = () => {
  emit("update:isDialogVisible", false);
};
</script>
