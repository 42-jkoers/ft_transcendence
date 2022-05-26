<template>
  <h2>User Profile</h2>
  <!-- User Name -->
  <div class="field">
    <div class="grid align-items-center">
      <div class="col-3"></div>
      <div class="col-3" align="right">
        <label class="label" for="name">User Name</label>
      </div>
      <div class="col-3" align="left">
        <InputText
          type="text"
          placeholder="username"
          class="description"
          :class="invalidUserName ? 'p-invalid' : ''"
        />
      </div>
    </div>
    <div class="col-offset-6" align="left" margin>
      <small
        >Username can only be composed of alphabet letters and digit.</small
      >
    </div>
    <div class="col-offset-6" align="left">
      <small v-if="invalidUserName" class="p-error"
        >Username is not valid.
      </small>
    </div>
  </div>
  <!-- Avatar -->
  <div class="field">
    <div class="grid align-items-center">
      <div class="col-3"></div>
      <div class="col-3" align="right">
        <label class="label" for="name">Avatar</label>
      </div>
      <div class="col-3" align="left">
        <InputText type="text" placeholder="avatar" />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import InputText from "primevue/inputtext";
import { ref } from "vue";
import storeUser from "@/store";
const username = ref<string>(storeUser.state.user.username);
const avatar = ref<string>(storeUser.state.user.avatar);
const invalidUserName = ref<boolean>(false);
</script>
<style scoped>
.label {
  padding-right: 12px;
  font-weight: 500;
  font-size: large;
}
</style>
