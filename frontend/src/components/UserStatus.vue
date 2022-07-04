<template>
  <Tag class="mr-2" :severity="style" :value="status" rounded :icon="icon" />
</template>
<script setup lang="ts">
import { defineProps, onMounted, ref } from "vue";
import Tag from "primevue/tag";

type TagSeverityType = "success" | "info" | "warning" | "danger" | undefined;

const props = defineProps({
  socketCount: Number,
  isGaming: Boolean,
});
const status = ref<string>();
const icon = ref<string>();
const style = ref<TagSeverityType>();

onMounted(() => {
  if (props.socketCount === 0) {
    status.value = "Offline";
    icon.value = "pi pi-power-off";
    style.value = undefined;
  } else {
    if (props.isGaming) {
      status.value = "Gaming";
      icon.value = "pi pi-discord";
      style.value = "info";
    } else {
      status.value = "Online";
      icon.value = "pi pi-user";
      style.value = "success";
    }
  }
});
</script>
