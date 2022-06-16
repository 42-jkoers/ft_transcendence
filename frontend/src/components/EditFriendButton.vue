<template>
  <Toast />
  <ConfirmDialog></ConfirmDialog>
  <Button
    class="p-button-rounded p-button-text p-button-outlined"
    :label="props.buttonLabel"
    :icon="props.buttonIcon"
    @click="confirm1"
  />
</template>
<script setup lang="ts">
import { defineEmits, defineProps } from "vue";
import Button from "primevue/button";
import axios from "axios";
import storeUser from "@/store";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import ConfirmDialog from "primevue/confirmdialog";
import Toast from "primevue/toast";
const props = defineProps({
  friendId: Number,
  buttonLabel: String,
  buttonIcon: String,
  action: Number,
});
const confirm = useConfirm();
const toast = useToast();
function confirm1() {
  confirm.require({
    message: "Are you sure you want to proceed?",
    header: "Confirmation",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      toast.add({
        severity: "info",
        summary: "Confirmed",
        detail: "You have confirmed",
        life: 3000,
      });
      editFriend(props.friendId, props.action);
    },
    reject: () => {
      toast.add({
        severity: "error",
        summary: "Rejected",
        detail: "You have cancelled",
        life: 3000,
      });
    },
  });
}

const emit = defineEmits<{
  (event: "isActionSuccess"): boolean;
}>();

async function editFriend(
  friendId: number | undefined,
  action: number | undefined
) {
  const postBody = {
    userId: storeUser.state.user.id,
    friendId: friendId,
    action: action,
  };
  await axios
    .post("http://localhost:3000/user/edit-friend", postBody, {
      withCredentials: true,
    })
    .then(async () => {
      emit("isActionSuccess", true);
    })
    .catch(() => {
      emit("isActionSuccess", false);
    });
}
</script>
