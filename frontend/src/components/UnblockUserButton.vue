<template>
  <Button
    label="Unblock"
    class="p-button-outlined"
    @click="unblockUser(props.userId)"
  />
</template>

<script setup lang="ts">
import { inject, defineProps } from "vue";
import { Socket } from "socket.io-client";
import Button from "primevue/button";

const props = defineProps(["userId"]);

const socket: Socket | undefined = inject("socketioInstance");

const unblockUser = (id: number) => {
  socket?.emit("unblockUser", { id });
};
</script>
