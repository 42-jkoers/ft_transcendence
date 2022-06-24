<template>
  <div>
    <router-link class="title" style="text-decoration: none" to="/">
      PONG
    </router-link>
    <div v-if="isUserLogIn">
      <HomeMenu />
    </div>
    <div><Toast /></div>
    <div><ConfirmDialog /></div>
  </div>
</template>
<script setup lang="ts">
import HomeMenu from "@/components/HomeMenu.vue";
import storeUser from "@/store";
import Toast from "primevue/toast";
import ConfirmDialog from "primevue/confirmdialog";
import { computed } from "vue";

const isUserLogIn = computed(() => {
  return (
    storeUser.state.isAuthenticated && storeUser.state.user.username !== ""
  );
});
</script>
<style scoped>
.title {
  font-size: xx-large;
  font-weight: 600;
}
</style>
