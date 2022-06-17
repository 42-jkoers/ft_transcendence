<template>
  <ConfirmDialog></ConfirmDialog>
  <Button
    class="p-button-rounded p-button-text p-button-outlined"
    :label="props.buttonLabel"
    :icon="props.buttonIcon"
    @click="proceedConfirmation"
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
import {
  EditFriendActionType,
  friendActionMessage,
} from "@/types/editFriendAction";

const props = defineProps({
  friendId: Number,
  buttonLabel: String,
  buttonIcon: String,
  action: Number,
});
const confirm = useConfirm();
const toast = useToast();
function proceedConfirmation() {
  confirm.require({
    message: "Are you sure you want to proceed?",
    header: "Confirmation",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      editFriend(props.friendId, props.action);
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
      if (props.action !== EditFriendActionType.REJECT_REQUEST) {
        toast.add({
          severity: "success",
          summary: "Success",
          detail: friendActionMessage(props.action),
          life: 3000,
        });
      }
    })
    .catch((error) => {
      emit("isActionSuccess", false);
      toast.add({
        severity: "warn",
        summary: "Note",
        detail: error.response.data.message,
        life: 3000,
      });
    });
}
</script>
