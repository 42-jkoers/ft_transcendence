<template>
  <form class="form" @submit.prevent="onSubmit">
    <div class="update-profile-error">
      <p v-if="error_empty">Input field cannot be empty, please resumbit!</p>
    </div>
    <div>
      <label class="update-profile-label">Avatar</label>
      <input
        class="update-profile-input-box"
        type="text"
        placeholder="please input"
        v-model="avatar"
      />
      <button class="update-profile-button" @click="sendFrom">submit</button>
      <p v-if="isSuccess" class="update-profile-success">
        Thank you! Your input is saved successfully!
      </p>
    </div>
  </form>
</template>
<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
// reactive state
const avatar = ref<string>("");
const isSuccess = ref<boolean>(false);
const error_empty = ref<boolean>(false);
const error_duplicate = ref<boolean>(false);

async function sendFrom() {
  // reset boolean for submit checks
  error_duplicate.value = false;
  error_empty.value = false;
  isSuccess.value = false;

  // check if input is empty
  if (avatar.value === "") {
    error_empty.value = true;
    return;
  }
  // retrieve user id
  const response_user = await axios.get("http://localhost:3000/auth/status", {
    withCredentials: true,
  });
  const body = {
    id: response_user.data.id,
    avatar: avatar.value,
  };
  // post avatar to update user profile
  const response_post = await axios.post(
    "http://localhost:3000/user/profile/update-avatar",
    body,
    {
      withCredentials: true, // to enable authenticated user log-in state pass-through from back-end
    }
  );
  // if avatar already exists, return undefined from response
  if (!response_post.data) {
    error_duplicate.value = true;
  } else {
    isSuccess.value = true;
  }
}
</script>
<style>
/* please see UpdateProfile_UserName.vue */
</style>
