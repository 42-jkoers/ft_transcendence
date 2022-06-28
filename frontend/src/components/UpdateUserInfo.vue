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
  <!-- Submit/Deregister Button -->
  <div class="grid align-items-center">
    <div class="col-offset-5">
      <Button @click="updateData" label="Save" icon="pi pi-save" />
    </div>
    <div class="col-3">
      <Button
        class="p-button-danger"
        label="Deregister"
        icon="pi pi-info-circle"
        iconPos="left"
        @click="proceedConfirmation"
      />
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
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";
import { errorMessage, ErrorType } from "@/types/errorManagement";
import { useRouter } from "vue-router";

const router = useRouter();
const confirm = useConfirm();
const toast = useToast();

const username = ref<string>(storeUser.state.user.username);
const avatar = ref<string>(storeUser.state.user.avatar);
const twoFactor = ref<boolean>(storeUser.state.user.twoFactorEnabled);
const isUserNameInvalid = ref<boolean>(false);
const invalidUserNameMessage = ref<string>("");

const emit = defineEmits<{
  (event: "updated"): boolean;
}>();

function isUserNameValid(input: string) {
  if (input.length === 0) {
    invalidUserNameMessage.value = "User name cannot be empty.";
    return false;
  }
  if (input.length > 15) {
    invalidUserNameMessage.value = "User name is too long (max 15 characters).";
    return false;
  }
  // only allow digit and alphabet letters, with space in between (not first/last)
  if (/^[A-Za-z0-9][A-Za-z0-9 ]*[A-Za-z0-9]$/.test(input) === false) {
    invalidUserNameMessage.value = "User name contains invalid character.";
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

function warnUserNameInvalid(message: string) {
  toast.add({
    severity: "error",
    summary: "Error",
    detail: message,
    life: 3000,
  });
  isUserNameInvalid.value = true;
  setTimeout(() => (isUserNameInvalid.value = false), 3000);
}

async function updateData() {
  if (isUserNameValid(username.value) === false) {
    warnUserNameInvalid(invalidUserNameMessage.value);
  } else {
    // post username to update user profile
    const postBody = {
      id: storeUser.state.user.id,
      username: username.value,
      avatar: avatar.value,
      isTwoFactorAuthEnabled: twoFactor.value,
    };
    await axios
      .post("http://localhost:3000/user/profile/update-userprofile", postBody, {
        withCredentials: true,
      })
      .then((response_post) => {
        // if username already exists, return undefined from response
        if (!response_post.data) {
          warnUserNameInvalid("User name already exits.");
        } else {
          toast.add({
            severity: "success",
            summary: "Success",
            detail: "Input saved!",
            life: 3000,
          });
          // update storeUser
          storeUser.state.user.username = username.value;
          storeUser.state.user.avatar = avatar.value;
          //if the 2f is enabled, the user is routed to the generate qrcode page
          if (
            !storeUser.state.user.twoFactorEnabled &&
            twoFactor.value === true
          ) {
            router.push({ name: "enableTwoFactor" });
          }
          //update after check the value of the change on the 2fEnable
          storeUser.state.user.twoFactorEnabled = twoFactor.value;
          // send signal to parent component
          emit("updated", true);
        }
      })
      .catch(() => {
        toast.add({
          severity: "error",
          summary: "Error",
          detail: errorMessage(ErrorType.GENERAL),
          life: 3000,
        });
      });
  }
}

async function proceedConfirmation() {
  confirm.require({
    message: "Are you sure you want to deregister?",
    header: "Confirmation",
    icon: "pi pi-exclamation-triangle",
    accept: async () => {
      await deregister();
    },
  });
}

async function deregister() {
  const postBody = {
    id: storeUser.state.user.id,
  };
  await axios
    .post("http://localhost:3000/user/deregister", postBody, {
      withCredentials: true,
    })
    .then(() => {
      toast.add({
        severity: "info",
        summary: "Info",
        detail: "User is deregistered.",
        life: 3000,
      });
      storeUser.dispatch("logout");
      router.push({ name: "Home" });
    })
    .catch(() => {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: errorMessage(ErrorType.GENERAL),
        life: 3000,
      });
    });
}
</script>
<style scoped>
.label {
  padding-right: 12px;
  font-weight: 500;
  font-size: large;
}
</style>
