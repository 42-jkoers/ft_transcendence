<template>
  <Tag class="mr-2" :severity="style" :value="status" rounded :icon="icon" />
</template>
<script setup lang="ts">
import { defineProps, onMounted, ref } from "vue";
import Tag from "primevue/tag";

type TagSeverityType = "success" | "info" | "warning" | "danger" | undefined;

const props = defineProps({
  socketCount: Number,
});
const status = ref<string>();
const icon = ref<string>();
const style = ref<TagSeverityType>();

onMounted(() => {
  if (props.socketCount == 0) {
    status.value = "Offline";
    icon.value = "pi pi-power-off";
    style.value = undefined;
  } else {
    // TODO: to add game status
    status.value = "Online";
    icon.value = "pi pi-user";
    style.value = "success";
  }
});
</script>
