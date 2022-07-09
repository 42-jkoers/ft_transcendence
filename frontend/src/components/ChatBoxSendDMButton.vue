<template>
  <Button
    label="Message"
    icon="pi pi-envelope"
    class="p-button-rounded p-button-outlined"
    @click="sendDM"
  />
</template>
<script setup lang="ts">
import { inject, computed, defineProps, defineEmits } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Socket } from "socket.io-client";
import Button from "primevue/button";
import { useStore } from "vuex";

const props = defineProps(["clickedUserId"]);
const emit = defineEmits(["closeDialog"]);

const socket: Socket = inject("socketioInstance") as Socket;
const store = useStore();
const route = useRoute();
const router = useRouter();

const sendDM = () => {
  const dMRoom = computed(() =>
    store.state.roomsInfo.find(
      (room) =>
        room.isDirectMessage &&
        room.secondParticipant[0] === props.clickedUserId
    )
  );

  if (dMRoom.value) {
    if (route.params.roomName === dMRoom.value.name) {
      emit("closeDialog", true);
    }
    router.push({
      name: "ChatBox",
      params: { roomName: dMRoom.value.name },
    });
  } else {
    const dMRequest = {
      isDirectMessage: true,
      userIds: [props.clickedUserId],
    };
    socket.emit("createDirectMessageRoom", dMRequest);
  }
};
</script>
