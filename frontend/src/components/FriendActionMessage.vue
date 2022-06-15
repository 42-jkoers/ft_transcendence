<template>
  <div v-if="showMessage">
    <Message :severity="messageSeverity" :closable="false">
      {{ message }}
    </Message>
  </div>
</template>
<script setup lang="ts">
import { ref, defineProps, watchEffect } from "vue";
import Message from "primevue/message";
import EditFriendActionType from "@/types/EditFriendActionType";
import { friendActionMessage } from "@/types/editFriend";

const props = defineProps({
  action: Number,
  notify: Boolean,
});
type MessageSeverityType = "success" | "info" | "warn" | "error" | undefined;
const showMessage = ref<boolean>(false);
const message = ref<string>();
const messageSeverity = ref<MessageSeverityType>();
const tracker = ref<boolean>();

watchEffect(() => {
  tracker.value = props.notify;
  if (props.action !== undefined) {
    displayMessage();
  }
});

function displayMessage() {
  if (props.action === EditFriendActionType.ERROR) {
    messageSeverity.value = "error";
  } else {
    messageSeverity.value = "success";
  }
  message.value = friendActionMessage(props.action);
  showMessage.value = true;
  setTimeout(() => (showMessage.value = false), 2000);
}
</script>
