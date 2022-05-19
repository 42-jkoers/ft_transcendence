<template>
  <div id="chatrooms">
    <PrimeVueButton
      @click="openCreateRoomCard"
      label="New Chat Room"
      icon="pi pi-plus"
      class="p-button-primary"
    />
    <router-view></router-view>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "@vue/runtime-core";
import PrimeVueButton from "primevue/button";

export default defineComponent({
  name: "ChatRooms",
  components: {
    PrimeVueButton,
  },
  methods: {
    openCreateRoomCard() {
      this.$router.push({ name: "create-chatroom" });
    },
  },
});
</script>
