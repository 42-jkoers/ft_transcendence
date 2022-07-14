<template>
  <Dialog
    header="Choose your game mode"
    :visible="isDialogVisible"
    @update:visible="handleClose"
  >
    <div class="card flex align-items-center justify-content-center">
      <SelectButton v-model="gameModeOption" :options="options" class="" />
    </div>
    <template #footer>
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
import {
  defineEmits,
  defineProps,
  inject,
  onMounted,
  onUnmounted,
  ref,
} from "vue";
import { Socket } from "socket.io-client";
import Dialog from "primevue/dialog";
import Button from "primevue/button";

import SelectButton from "primevue/selectbutton";
import { useStore } from "vuex";

defineProps(["isDialogVisible"]);
const emit = defineEmits(["update:isDialogVisible"]);

const socket: Socket = inject("socketioInstance") as Socket;

const store = useStore();
const gameModeOption = ref<string>(store.state.user.gameMode);

onMounted(() => {
  socket.emit("getUserCustomizationOptions");

  socket.on("setUserCustomizationOptions", (gameMode) => {
    gameModeOption.value = gameMode;
  });
});

const options = ref(["normal", "fast"]);

const saveNewGameSettings = () => {
  socket.emit("saveUserCustomizationOptions", {
    gameMode: gameModeOption.value,
  });
  emit("update:isDialogVisible", false);
  store.commit("updateGameMode", gameModeOption.value);
};

const handleClose = () => {
  emit("update:isDialogVisible", false);
};
</script>
