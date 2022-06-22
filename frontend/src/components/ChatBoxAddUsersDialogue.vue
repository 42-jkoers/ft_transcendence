<template>
  <Dialog
    :visible="isDialogVisible"
    :style="{ width: '50vw' }"
    @update:visible="handleClose"
  >
    <template #header>
      <h3>Users</h3>
    </template>
    <DataTable :value="userList"> </DataTable>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from "vue";
import Dialog from "primevue/dialog";
import DataTable from "primevue/datatable";

const props = defineProps(["isDialogVisible"]);
const emit = defineEmits(["update:isDialogVisible"]);
const userList = ref([]);

const handleClose = () => {
  emit("update:isDialogVisible", false);
};
</script>
