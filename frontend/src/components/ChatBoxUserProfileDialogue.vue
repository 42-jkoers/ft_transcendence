<template>
  <Dialog
    header="User Profile"
    :visible="isDialogVisible"
    closeOnEscape
    :closable="false"
    position="right"
  >
    <div class="field p-fluid">
      <Image
        :src="clickedUserObject.avatar"
        width="250"
        heigth="250"
        alt="User Profile"
      />
    </div>
    <template #footer>
      <Button
        label="Message"
        icon="pi pi-envelope"
        @click="sendDM"
        class="p-button-text"
      />
      <Button
        label="View Profile"
        icon="pi pi-user"
        @click="pushToProfile"
        autofocus
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Image from "primevue/image"; //TODO style img width

const props = defineProps(["isDialogVisible", "clickedUserObject"]);
console.log(props.clickedUserObject);

const emit = defineEmits(["update:isDialogVisible"]);
</script>
