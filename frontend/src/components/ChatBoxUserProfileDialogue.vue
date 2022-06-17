<template>
  <Dialog
    header="User Profile"
    :visible="isDialogVisible"
    closeOnEscape
    :closable="false"
  >
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from "vue";
import Dialog from "primevue/dialog";

const props = defineProps(["isDialogVisible", "clickedUserObject"]);

const emit = defineEmits(["update:isDialogVisible"]);
</script>
