<template>
  <div v-if="isVisible">
    <Tag class="mr-2" :severity="style" :value="status" rounded :icon="icon" />
  </div>
</template>
<script setup lang="ts">
import { defineProps, ref, inject } from "vue";
import Tag from "primevue/tag";
import { PlayerGameStatusType } from "@/types/GameStatus.enum";
import { Socket } from "socket.io-client";
import { computed } from "@vue/reactivity";

type TagSeverityType = "success" | "info" | "warning" | "danger" | undefined;

const props = defineProps({
  userId: Number,
  gameStatus: Number,
});
const icon = ref<string>();
const style = ref<TagSeverityType>();
const status = ref<string>();
const userConnectedSocketCount = ref<number>(0);
const isSafe = ref<boolean>(true);

const socket: Socket = inject("socketioInstance") as Socket;
socket.on("getUserConnectedSocketCount", (socketCount, isSafeResponse) => {
  userConnectedSocketCount.value = socketCount;
  isSafe.value = isSafeResponse;
});

const isVisible = computed(() => {
  socket.emit("getUserConnectedSocketCount", { data: props.userId });
  if (userConnectedSocketCount.value === 0) {
    icon.value = "pi pi-power-off";
    style.value = undefined;
    status.value = "Offline";
  } else {
    if (props.gameStatus === PlayerGameStatusType.PLAYING) {
      icon.value = "pi pi-discord";
      style.value = "info";
      status.value = "Gaming";
    } else {
      icon.value = "pi pi-user";
      style.value = "success";
      status.value = "Online";
    }
  }
  return isSafe.value;
});
</script>
