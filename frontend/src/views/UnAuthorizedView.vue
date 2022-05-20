<template>
  <p class="message">Oops, you are not logged in yet.</p>
  <BackToHome />
  <br />
  <LogIn />
</template>
<script lang="ts">
import LogIn from "@/components/LogIn.vue";
import BackToHome from "@/components/BackToHome.vue";
export default {
  components: { LogIn, BackToHome },
};
</script>
<style scoped>
.message {
  color: darkcyan;
  font-size: large;
  font-weight: 600;
}
</style>
