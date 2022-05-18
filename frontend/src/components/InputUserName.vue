<template>
  <div class="input-field">
    <label class="label">UserName</label>
    <input
      class="input-box"
      type="text"
      placeholder="User Name"
      autocomplete="off"
    />
  </div>
  <br />
  <div class="input-field">
    <label class="label">Avatar</label>
    <input
      class="input-box"
      type="text"
      placeholder="Avatar"
      autocomplete="off"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
</script>
<style scoped>
.label {
  padding-right: 12px;
}
.input-box::placeholder {
  color: grey;
}
</style>
