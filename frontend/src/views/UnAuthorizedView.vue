<template>
  <p class="message">Oops, you are not logged in yet.</p>
</template>
<script lang="ts">
import { Vue } from "vue-class-component";

export default class UnAuthorizedView extends Vue {}
</script>
<style scoped>
.message {
  color: darkcyan;
  font-size: large;
  font-weight: 600;
}
</style>
