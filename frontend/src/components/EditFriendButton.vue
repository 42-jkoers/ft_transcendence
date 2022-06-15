<template>
  <Button
    class="p-button-rounded p-button-text p-button-outlined"
    :label="props.buttonLabel"
    :icon="props.buttonIcon"
    @click="editFriend(props.friendId, props.action)"
  />
</template>
<script setup lang="ts">
import { defineEmits, ref, defineProps } from "vue";
import Button from "primevue/button";
import axios from "axios";
import storeUser from "@/store";

const showSuccessMessage = ref<boolean>(false);
const showFailMessage = ref<boolean>(false);
const successMessage = ref<string>();

const props = defineProps({
  friendId: Number,
  buttonLabel: String,
  buttonIcon: String,
  action: Number,
});

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
