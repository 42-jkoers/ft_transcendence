<template>
  <div v-if="showConfirmButton">
    <Button @click="requestConfirm">{{ props.buttonLabel }}</Button>
  </div>
  <div v-else class="card">
    <h3>Are you sure you want to proceed?</h3>
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
    <h3 class="message">{{ props.successMessage }}</h3>
  </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import { ref, defineEmits, defineProps } from "vue";
const showConfirmButton = ref<boolean>(true);
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
}

function proceedConfirm() {
  emit("confirm", true);
  showConfirmButton.value = true;
  showSuccessMessage.value = true;
  setTimeout(() => (showSuccessMessage.value = false), 2000);
}

function cancelConfirm() {
  showConfirmButton.value = true;
}
</script>
<style scoped>
.message {
  color: greenyellow;
}
</style>
