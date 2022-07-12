<template>
  <Dialog
    header="Game options"
    :visible="isDialogVisible"
    :style="{ width: '50vw' }"
    @update:visible="handleClose"
  >
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" />
      <Button label="Save" icon="pi pi-check" autofocus />
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { defineEmits, defineProps, inject } from "vue";
import { Socket } from "socket.io-client";
import Dialog from "primevue/dialog";
import Button from "primevue/button";

defineProps(["isDialogVisible"]);
const emit = defineEmits(["update:isDialogVisible"]);

const socket: Socket = inject("socketioInstance") as Socket;
const handleClose = () => {
  socket.emit("saveUserCustomizationOptions");
  emit("update:isDialogVisible", false);
};
</script>
