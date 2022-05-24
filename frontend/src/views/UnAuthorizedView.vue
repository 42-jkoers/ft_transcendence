<template>
  <p class="message">Oops, you are not logged in yet.</p>
  <BackToHome />
  <br />
  <LogInButton />
</template>
<script lang="ts">
import LogInButton from "@/components/LogInButton.vue";
import BackToHome from "@/components/BackToHome.vue";
export default {
  components: { LogInButton, BackToHome },
};
</script>
<style scoped>
.message {
  color: darkcyan;
  font-size: large;
  font-weight: 600;
}
</style>
