<template>
  <div class="flex justify-content-center align-items-center">
    <div></div>
    <div style="margin-top: 20%">
      <Button
        label="Join Queue"
        class="p-button-rounded p-button-text p-button-outlined"
        icon="pi pi-plus-circle"
        @click="joinQueue"
      ></Button>
    </div>
  </div>
</template>
<script setup lang="ts">
import Button from "primevue/button";

function joinQueue() {
  console.log("join queque");
}
</script>
