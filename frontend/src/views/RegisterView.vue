<template>
  <h2>Register New User</h2>
  <UpdateUserInfo @updated="redirectToHome($event)" />
</template>
<script setup lang="ts">
import UpdateUserInfo from "@/components/UpdateUserInfo.vue";
import router from "@/router";
function redirectToHome(e: boolean) {
  if (e) {
    setTimeout(() => router.push({ name: "UserHome" }), 1000);
  }
}
</script>
<style scoped></style>
