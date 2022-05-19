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
      <button class="button" @click="sendFrom">register</button>
    </form>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
// reactive state
const username = ref<string>("");
const avatar = ref<string>("");

/*
 ** first get user id,
 ** then post username and avatar to update user profile
 */
async function sendFrom(args: string) {
  const response_user = await axios.get("http://localhost:3000/auth/status", {
    withCredentials: true,
  });
  const body = {
    id: response_user.data.id,
    username: username.value,
    avatar: avatar.value,
  };
  const response_post = await axios.post(
    "http://localhost:3000/auth/register",
    body,
    {
      withCredentials: true, // to enable authenticated user log-in state pass-through from back-end
    }
  );
  console.log(response_post.data);
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
