<template>
  <Dialog
    header="Edit Room Privacy"
    :visible="isDialogVisible"
    closeOnEscape
    :style="{ width: '50vw' }"
    :closable="false"
  >
    <div class="field p-fluid">
      <small v-if="props.room.protected" id="password-help"
        >Change the '{{ room.name }}' room password.</small
      >
      <small v-else id="password-help"
        >Protect your '{{ room.name }}' with a password</small
      >
      <BlockUI :blocked="removePasswordChecked">
        <Password
          id="password"
          v-model="passwordValue"
          :feedback="true"
          toggleMask
        />
      </BlockUI>
    </div>
    <template #footer>
      <div class="mt-3">
        <div v-if="props.room.protected" class="field-checkbox">
          <Checkbox
            id="remove-password"
            v-model="removePasswordChecked"
            :binary="true"
            @change="showValue"
          />
          <label for="remove-password">Remove password</label>
        </div>
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="closePasswordDialog"
          class="p-button-text"
        />
        <Button
          v-if="props.room.protected"
          label="Update"
          icon="pi pi-check"
          @click="updateRoomPassword"
          autofocus
        />
        <Button
          v-else
          label="Set password"
          icon="pi pi-check"
          @click="updateRoomPassword"
          autofocus
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, inject, defineEmits, defineProps } from "vue";
import { Socket } from "socket.io-client";
import Dialog from "primevue/dialog";
import Password from "primevue/password";
import Button from "primevue/button";
import Checkbox from "primevue/checkbox";
import BlockUI from "primevue/blockui";

const socket: Socket = inject("socketioInstance");

const props = defineProps(["isDialogVisible", "room"]);

const emit = defineEmits(["update:isDialogVisible"]);

const passwordValue = ref();

const closePasswordDialog = () => {
  passwordValue.value = null;
  emit("update:isDialogVisible", false);
};

const removePasswordChecked = ref<boolean>(false);

const showValue = () =>
  console.log("IS removePasswordChecked? ", removePasswordChecked.value);

const updateRoomPassword = () => {
  if (passwordValue.value === "") {
    passwordValue.value = null;
  }
  socket.emit("updateRoomPassword", {
    name: props.room.name,
    password: passwordValue.value,
  });
  closePasswordDialog();
};
</script>
