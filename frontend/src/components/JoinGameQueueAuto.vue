<template>
  <div>
    <Button
      label="Find A Match"
      class="p-button-rounded"
      v-tooltip.top="'You will be automatically matched by the system.'"
      @click="joinWaitingRoom"
    ></Button>
  </div>
</template>
<script setup lang="ts">
import Button from "primevue/button";
import { useRouter } from "vue-router";

const router = useRouter();

function joinWaitingRoom() {
  router.push({ name: "GameWaitingRoom", params: { type: "auto" } });
}
</script>
