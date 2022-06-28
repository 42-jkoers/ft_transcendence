<template>
  <Dialog
    header="Password required"
    :visible="isDialogVisible"
    closeOnEscape
    :style="{ width: '50vw' }"
    :closable="false"
  >
    <div class="field p-fluid">
      <small v-if="matchingPasswordError" id="password-help" class="p-error"
        >Entered password is incorrect.</small
      >
      <small v-else id="password-help"
        >Enter room password to join '{{ roomName }}'</small
      >
      <Password
        id="password"
        v-model="passwordValue"
        :feedback="false"
        toggleMask
      />
    </div>
    <template #footer>
      <Button
        label="Cancel"
        icon="pi pi-times"
        @click="closePasswordDialog"
        class="p-button-text"
      />
      <Button
        label="OK"
        icon="pi pi-check"
        @click="validatePassword"
        autofocus
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, inject, defineEmits, defineProps } from "vue";
import { useRouter } from "vue-router";
import { Socket } from "socket.io-client";
import Dialog from "primevue/dialog";
import Password from "primevue/password";
import Button from "primevue/button";

const socket: Socket = inject("socketioInstance");

const props = defineProps(["isDialogVisible", "roomName"]);

const emit = defineEmits(["update:isDialogVisible"]);

const passwordValue = ref();

const closePasswordDialog = () => {
  passwordValue.value = null;
  matchingPasswordError.value = false;
  emit("update:isDialogVisible", false);
};

const router = useRouter();
const matchingPasswordError = ref(false);

const validatePassword = () => {
  socket.emit("checkRoomPasswordMatch", {
    name: props.roomName,
    password: passwordValue.value,
  });
  socket.on("isRoomPasswordMatched", (isMatched: boolean) => {
    if (isMatched) {
      closePasswordDialog();
      socket.emit("addUserToRoom", props.roomName);
      router.push({
        name: "ChatBox",
        params: { roomName: props.roomName },
      });
    } else {
      matchingPasswordError.value = true;
    }
  });
};
</script>
