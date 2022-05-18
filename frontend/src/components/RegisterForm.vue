<template>
  <div class="register-form">
    <p class="form-title">Register New User</p>
    <form class="form" @submit.prevent="onSubmit">
      <div class="input-field">
        <label class="label">UserName</label>
        <input
          class="input-box"
          type="text"
          placeholder="User Name"
          v-model="username"
        />
      </div>
      <br />
      <div class="input-field">
        <label class="label">Avatar</label>
        <input
          class="input-box"
          type="text"
          placeholder="Avatar"
          v-model="avatar"
        />
      </div>
      <br />
      <button class="button" @click="sendInput">register</button>
    </form>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
// reactive state
const username = ref("");
const avatar = ref("");
// functions that mutate state and trigger updates
function sendInput(args: string) {
  console.log("username is: ", username.value);
  console.log("avatar is: ", avatar.value);
}
// lifecyle
// onMounted(() => {});
</script>
<style scoped>
.form-title {
  color: darkcyan;
  font-size: large;
  font-weight: 600;
}
.label {
  padding-right: 12px;
}
.input-box::placeholder {
  color: grey;
}
.button {
  color: green;
}
</style>
