<template>
  <Dialog
    :visible="isDialogVisible"
    position="left"
    @update:visible="handleClose"
  >
    <template #header>
      <h3 icon="pi pi-times">{{ clickedUserObject.username }}</h3>
      <p v-if="isOnline">online</p>
      <p v-else>offline</p>
    </template>
    <Image
      :src="clickedUserObject.avatar"
      width="280"
      height="280"
      alt="User Profile"
    />
    <template #footer>
      <Button
        v-if="store.state.user.id !== props.clickedUserObject.id"
        label="Message"
        icon="pi pi-envelope"
        @click="sendDM"
      />
      <Button label="View Profile" icon="pi pi-user" @click="pushToProfile" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps, inject, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { Socket } from "socket.io-client";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Image from "primevue/image"; //TODO style img width
import { useStore } from "vuex";

const isOnline = ref(true); //FIXME change this when we have onlin/offline info in user
const props = defineProps(["isDialogVisible", "clickedUserObject"]);

const emit = defineEmits(["update:isDialogVisible"]);

const router = useRouter();
const pushToProfile = () => {
  router.push({
    name: "UserProfileCard",
    params: { id: props.clickedUserObject.id },
  });
};

const socket: Socket = inject("socketioInstance");
const store = useStore();
const route = useRoute();

const sendDM = () => {
  const dMRoom = computed(() =>
    store.state.roomsInfo.find(
      (room) =>
        room.isDirectMessage &&
        room.secondParticipant[0] === props.clickedUserObject.id
    )
  );
  if (dMRoom.value) {
    if (route.params.roomName === dMRoom.value.name) {
      handleClose();
    }
    router.push({
      name: "ChatBox",
      params: { roomName: dMRoom.value.name },
    });
  } else {
    const dMRequest = {
      isDirectMessage: true,
      userIds: [props.clickedUserObject.id],
    };
    socket.emit("createPrivateChatRoom", dMRequest);
  }
};

const handleClose = () => {
  emit("update:isDialogVisible", false);
};
</script>
