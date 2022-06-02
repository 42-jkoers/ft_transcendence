<template>
  <h2>User Profile</h2>
  <!-- User Name -->
  <div class="field">
    <div class="grid align-items-center">
      <div class="col-3"></div>
      <div class="col-3" align="right">
        <label class="label">User Name</label>
      </div>
      <div class="col-3" align="left">
        <InputText
          type="text"
          v-model="username"
          class="description"
          :class="isUserNameInvalid ? 'p-invalid' : ''"
        />
      </div>
    </div>
    <div class="col-offset-6" align="left" margin>
      <small font="italic"
        >* Username can only be composed of alphabet letters and digit.</small
      >
    </div>
    <div class="col-offset-6" align="left">
      <Message v-if="isUserNameInvalid" severity="error" :closable="false">
        {{ invalidUserNameMessage }}
      </Message>
    </div>
  </div>
  <!-- Avatar -->
  <div class="field">
    <div class="grid align-items-center">
      <div class="col-3"></div>
      <div class="col-3" align="right">
        <label class="label">Avatar</label>
      </div>
      <div class="col-3" align="left">
        <img :src="avatar" height="100" alt="user-profile" />
      </div>
    </div>
    <div class="grid">
      <div class="col-offset-6">
        <UploadAvatar @new-avatar="getNewAvatar($event)" />
      </div>
    </div>
  </div>
  <br />
  <!-- Button -->
  <div class="grid">
    <div class="col-offset-6" align="left">
      <div>
        <Button @click="updateData" label="Save" />
      </div>
      <div>
        <Message v-if="isUpdateSuccess" severity="success" :closable="false">
          Your input has been saved successfully!
        </Message>
      </div>
    </div>
    <div class="col-4"></div>
  </div>
</template>
<script setup lang="ts">
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Button from "primevue/button";
import { ref, defineEmits } from "vue";
import storeUser from "@/store";
import axios from "axios";
import UploadAvatar from "@/components/UploadAvatar.vue";

const username = ref<string>(storeUser.state.user.username);
const avatar = ref<string>(storeUser.state.user.avatar);
const isUpdateSuccess = ref<boolean>(false);
const isUserNameInvalid = ref<boolean>(false);
const invalidUserNameMessage = ref<string>("");

const emit = defineEmits<{
  (event: "updated"): boolean;
}>();

function isUserNameValid(input: string) {
  for (const c of input) {
    if (
      ((c >= "0" && c <= "9") ||
        (c >= "a" && c <= "z") ||
        (c >= "A" && c <= "Z")) === false
    ) {
      invalidUserNameMessage.value = "User name contains invalid character.";
      return false;
    }
  }
  if (input.length === 0) {
    invalidUserNameMessage.value = "User name cannot be empty.";
    return false;
  }
  if (input.length > 15) {
    invalidUserNameMessage.value = "User name is too long (max 15 characters).";
    return false;
  }
  return true;
}

function getNewAvatar(event) {
  avatar.value = require("../../../upload/" + event);
}

async function updateData() {
  let proceed = true;
  if (isUserNameValid(username.value) === false) {
    proceed = false;
    isUserNameInvalid.value = true;
    setTimeout(() => (isUserNameInvalid.value = false), 2000);
  }
  if (proceed) {
    // post username to update user profile
    const postBody = {
      id: storeUser.state.user.id,
      username: username.value,
      avatar: avatar.value,
    };
    const response_post = await axios.post(
      "http://localhost:3000/user/profile/update-userprofile",
      postBody,
      {
        withCredentials: true,
      }
    );
    // if username already exists, return undefined from response
    if (!response_post.data) {
      isUserNameInvalid.value = true;
      invalidUserNameMessage.value = "User name already exits.";
    } else {
      isUpdateSuccess.value = true;
      setTimeout(() => (isUpdateSuccess.value = false), 2000);
      // update storeUser
      storeUser.state.user.username = username.value;
      storeUser.state.user.avatar = avatar.value;
      console.log("state is updated");
      // send signal to parent component
      emit("updated", true);
    }
  }
}
</script>
<style scoped>
.label {
  padding-right: 12px;
  font-weight: 500;
  font-size: large;
}
.successMessage {
  color: yellowgreen;
}
</style>
