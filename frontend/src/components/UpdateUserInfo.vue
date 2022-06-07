<template>
  <h2>User Profile Settings</h2>
  <!-- User Name -->
  <div class="field">
    <div class="grid align-items-center">
      <div class="col-5" align="right">
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
    <div class="col-offset-5" align="left" margin>
      <small>
        * Username can only be composed of alphabet letters and digit, with
        potential space in between.
      </small>
    </div>
    <div class="col-offset-5" align="left">
      <Message v-if="isUserNameInvalid" severity="error" :closable="false">
        {{ invalidUserNameMessage }}
      </Message>
    </div>
  </div>
  <!-- Avatar -->
  <div class="field">
    <div class="grid align-items-center">
      <div class="col-5" align="right">
        <label class="label">Avatar</label>
      </div>
      <div class="col-3" align="left">
        <Avatar :image="avatar" shape="circle" size="xlarge" />
      </div>
    </div>
    <div class="col-offset-5" align="left">
      <UploadAvatar
        @new-avatar="getNewAvatar($event)"
        @avatar-source="changeAvatarSource($event)"
      />
    </div>
  </div>
  <!-- 2 factor authentication -->
  <div class="field">
    <div class="grid align-items-center">
      <div class="col-5" align="right">
        <label class="label">Two Factor Authentication</label>
      </div>
      <div class="col-1" align="left">
        <InputSwitch v-model="twoFactor" />
      </div>
      <div class="col-1">
        <label v-if="twoFactor">Enabled</label>
        <label v-else>Disabled</label>
      </div>
    </div>
  </div>
  <!-- Submit Button -->
  <div class="field">
    <div class="col-offset-5" align="left">
      <Button @click="updateData" label="Save" />
      <Message v-if="isUpdateSuccess" severity="success" :closable="false">
        Your input has been saved successfully!
      </Message>
    </div>
  </div>
</template>
<script setup lang="ts">
import InputText from "primevue/inputtext";
import Message from "primevue/message";
import Button from "primevue/button";
import Avatar from "primevue/avatar";
import InputSwitch from "primevue/inputswitch";
import { ref, defineEmits } from "vue";
import storeUser from "@/store";
import axios from "axios";
import UploadAvatar from "@/components/UploadAvatar.vue";

const username = ref<string>(storeUser.state.user.username);
const avatar = ref<string>(storeUser.state.user.avatar);
const twoFactor = ref<boolean>(storeUser.state.user.twoFactor);
const isUpdateSuccess = ref<boolean>(false);
const isUserNameInvalid = ref<boolean>(false);
const invalidUserNameMessage = ref<string>("");

const emit = defineEmits<{
  (event: "updated"): boolean;
}>();

function isUserNameValid(input: string) {
  // only allow digit and alphabet letters, with space in between (not first/last)
  if (/^[A-Za-z0-9][A-Za-z0-9 ]*[A-Za-z0-9]$/.test(input) === false) {
    invalidUserNameMessage.value = "User name contains invalid character.";
    return false;
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

function changeAvatarSource(event) {
  if (event == "default") {
    avatar.value = "/default_avatar.png";
  } else if (event == "current") {
    avatar.value = storeUser.state.user.avatar;
  }
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
      // TODO: add 2F
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
      storeUser.state.user.twoFactor = twoFactor.value;
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
</style>
