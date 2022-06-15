<template>
  <h1>2 Factor Authentication</h1>
  <div class="2fAuthValidation">
    <input type="text" name="2fAuthCode" />
    <br />
    <br />
    <button>Submit</button>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";

onMounted(() => {
  console.log("here");
});
</script>
