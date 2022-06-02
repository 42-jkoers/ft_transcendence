<template>
  <div v-if="showConfirmButton">
    <Button @click="requestConfirm">{{ props.buttonLabel }}</Button>
  </div>
  <div v-if="showQuestion" class="card">
    <Message severity="warn" :closable="false">
      Are you sure you want to proceed?
    </Message>
    <span class="p-buttonset">
      <Button
        label="Yes"
        class="p-button-success"
        icon="pi pi-check"
        iconPos="left"
        style="width: 110px"
        @click="proceedConfirm"
      />
      <Button
        label="Cancel"
        class="p-button-danger"
        icon="pi pi-times"
        iconPos="left"
        style="width: 110px"
        s
        @click="cancelConfirm"
      />
    </span>
  </div>
  <div v-if="showSuccessMessage">
    <Message severity="success" :closable="false">
      {{ props.successMessage }}
    </Message>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Message from "primevue/message";
import { ref, defineEmits, defineProps } from "vue";
const showConfirmButton = ref<boolean>(true);
const showQuestion = ref<boolean>(false);
const showSuccessMessage = ref<boolean>(false);
const props = defineProps({
  buttonLabel: String,
  successMessage: String,
});

const emit = defineEmits<{
  (event: "confirm"): boolean;
}>();

function requestConfirm() {
  showConfirmButton.value = false;
  showQuestion.value = true;
}

function proceedConfirm() {
  emit("confirm", true);
  showQuestion.value = false;
  showSuccessMessage.value = true;
  setTimeout(() => (showSuccessMessage.value = false), 2000);
}

function cancelConfirm() {
  showQuestion.value = false;
  showConfirmButton.value = true;
}
</script>
<style scoped>
.message {
  color: greenyellow;
}
</style>
