<template>
  <div v-if="showConfirmButton">
    <Button @click="requestConfirm" label="Confirm"></Button>
  </div>
  <div v-if="showQuestion" class="card">
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
</template>

<script setup lang="ts">
import Button from "primevue/button";
import { ref, defineEmits, defineProps } from "vue";
const showConfirmButton = ref<boolean>(true);
const showQuestion = ref<boolean>(false);
const props = defineProps({
  buttonLabel: String,
});
const emit = defineEmits<{
  (event: "confirm"): boolean;
}>();

function requestConfirm() {
  showQuestion.value = true;
  showConfirmButton.value = false;
}

function proceedConfirm() {
  console.log("props is: ", props.buttonLabel);
  emit("confirm", true);
}

function cancelConfirm() {
  showConfirmButton.value = true;
  showQuestion.value = false;
}
</script>
