<template>
  <Dialog
    :visible="isDialogVisible"
    position="left"
    @update:visible="handleClose"
  >
    <template #header>
      <h3 icon="pi pi-times">{{ clickedUserObject.username }}</h3>
      <UserStatus
        :userId="clickedUserObject.id"
        :gameStatus="clickedUserObject.gameStatus"
      />
    </template>
    <Image
      :src="clickedUserObject.avatar"
      width="280"
      height="280"
      alt="User Profile"
    />
    <template #footer>
      <ChatBoxSendDMButton
        :clickedUserId="clickedUserObject.id"
        v-if="userId !== props.clickedUserObject.id"
        @closeDialog="handleClose"
      />
      <Button
        label="View Profile"
        icon="pi pi-user"
        class="p-button-rounded p-button-outlined"
        @click="pushToProfile"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, defineEmits, defineProps } from "vue";
import { useRouter } from "vue-router";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import Image from "primevue/image"; //TODO style img width
import { useStore } from "vuex";
import ChatBoxSendDMButton from "./ChatBoxSendDMButton.vue";
import UserStatus from "./UserStatus.vue";

const props = defineProps(["isDialogVisible", "clickedUserObject"]);

const emit = defineEmits(["update:isDialogVisible"]);

const router = useRouter();
const pushToProfile = () => {
  router.push({
    name: "UserProfileCard",
    params: { id: props.clickedUserObject.id },
  });
};

const store = useStore();
const userId = ref<number>(store.state.user.id);

const handleClose = () => {
  emit("update:isDialogVisible", false);
};
</script>
