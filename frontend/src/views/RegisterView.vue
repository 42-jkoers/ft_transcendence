<template>
  <div align="center">
    <div class="col-5">
      <Message severity="info" :closable="false">
        Welcome new user, please register.
      </Message>
    </div>
  </div>
  <UpdateUserInfo @updated="redirectToHome($event)" />
</template>
<script setup lang="ts">
import UpdateUserInfo from "@/components/UpdateUserInfo.vue";
import router from "@/router";
import Message from "primevue/message";
function redirectToHome(e: boolean) {
  if (e) {
    setTimeout(() => router.push({ name: "UserHome" }), 1000);
  }
}
</script>
<style scoped></style>
