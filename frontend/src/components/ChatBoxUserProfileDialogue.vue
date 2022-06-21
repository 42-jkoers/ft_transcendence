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
      <Button label="Message" icon="pi pi-envelope" @click="sendDM" />
      <Button label="View Profile" icon="pi pi-user" @click="pushToProfile" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from "vue";
import { useRouter } from "vue-router";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Image from "primevue/image"; //TODO style img width

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

const sendDM = () => {
  //TODO add DM logic
};

const handleClose = () => {
  emit("update:isDialogVisible", false);
};
</script>
