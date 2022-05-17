<template>
  <div id="chatrooms">
    <PrimeVueButton
      @click="openCreateRoomCard"
      label="New Chat Room"
      icon="pi pi-plus"
      class="p-button-primary"
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
  methods: {
    openCreateRoomCard() {
      alert("A new Room will be created here");
    },
  },
};
</script>
