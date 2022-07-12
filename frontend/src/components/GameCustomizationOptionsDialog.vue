<template>
  <Dialog
    header="Customize your game"
    :visible="isDialogVisible"
    :style="{ width: '50vw' }"
    @update:visible="handleClose"
  >
    <div class="card flex align-items-center justify-content-start">
      <h5>Select paddle color</h5>
      <ColorPicker v-model="paddleColor" class="m-2" />
    </div>
    <template #footer>
      <Button
        label="Reset"
        icon="pi pi-refresh"
        class="p-button-text"
        @click="reset"
      />
      <Button
        label="Save"
        icon="pi pi-check"
        autofocus
        @click="saveNewGameSettings"
      />
    </template>
  </Dialog>
</template>
<script setup lang="ts">
import { defineEmits, defineProps, inject, ref } from "vue";
import { Socket } from "socket.io-client";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import ColorPicker from "primevue/colorpicker";

defineProps(["isDialogVisible"]);
const emit = defineEmits(["update:isDialogVisible"]);

const socket: Socket = inject("socketioInstance") as Socket;
const defaultPaddleValues = {
  paddleColor: "fffafa",
  // paddleSize: "1",
};
const paddleColor = ref("fffafa");
const paddleSize = ref("1");

const reset = () => {
  paddleColor.value = defaultPaddleValues.paddleColor;
  // paddleSize.value = defaultPaddleValues.paddleSize;
};

const saveNewGameSettings = () => {
  // console.log("paddleColor value", paddleColor.value);
  socket.emit("saveUserCustomizationOptions", { paddleColor: paddleColor });
  emit("update:isDialogVisible", false);
};

const handleClose = () => {
  reset();
  emit("update:isDialogVisible", false);
};
</script>
