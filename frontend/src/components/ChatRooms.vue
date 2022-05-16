<template>
  <div id="chatrooms">
    <PrimeVueButton
      label="New Chat Room"
      icon="pi pi-plus"
      class="p-button-info"
    />
  </div>
</template>

<script lang="ts">
import PrimeVueButton from "primevue/button";

export default {
  name: "ChatRooms",
  components: {
    PrimeVueButton,
  },
};
</script>
