<template>
  <Tag class="mr-2" :severity="style" :value="status" rounded :icon="icon" />
</template>
<script setup lang="ts">
import { defineProps, ref, inject } from "vue";
import Tag from "primevue/tag";
import { GameStatusType } from "@/types/GameStatus.enum";
import { Socket } from "socket.io-client";
import { computed } from "@vue/reactivity";

type TagSeverityType = "success" | "info" | "warning" | "danger" | undefined;

const props = defineProps({
  userId: Number,
  gameStatus: Number,
});
const icon = ref<string>();
const style = ref<TagSeverityType>();
const userConnectedSocketCount = ref<number>(0);

const socket: Socket = inject("socketioInstance") as Socket;
socket.on("getUserConnectedSocketCount", (response) => {
  userConnectedSocketCount.value = response;
});

const status = computed(() => {
  socket.emit("getUserConnectedSocketCount", props.userId);
  if (userConnectedSocketCount.value === 0) {
    icon.value = "pi pi-power-off";
    style.value = undefined;
    return "Offline";
  } else {
    if (props.gameStatus === GameStatusType.PLAYING) {
      icon.value = "pi pi-discord";
      style.value = "info";
      return "Gaming";
    } else {
      icon.value = "pi pi-user";
      style.value = "success";
      return "Online";
    }
  }
});
</script>
