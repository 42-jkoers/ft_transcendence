<template>
  <h1>2 Factor Authentication</h1>
  <div class="2fAuthValidation">
    <p>Please provide your two factor authentication code</p>
    <InputText type="text" v-model="validationCode" />
    <br />
    <br />
    <Button @click="submitCode" label="Submit" />
    <Message
      v-if="!validate2F && codeSubmited"
      severity="error"
      :closable="false"
      >Wrong two factor authentication code. Please try again!</Message
    >
  </div>
</template>

<script setup lang="ts">
import axios from "axios";
import { ref } from "vue";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import router from "@/router";
import Message from "primevue/message";

const validationCode = ref<string>("");
const validate2F = ref<boolean>(true);
const codeSubmited = ref<boolean>(false);
const errorCount = ref<number>(0);

async function submitCode() {
  codeSubmited.value = true;
  const body = {
    twoFactorAuthCode: validationCode.value,
  };

  await axios
    .post("http://localhost:3000/auth/2f", body, {
      withCredentials: true,
    })
    .then(() => {
      router.push({ name: "UserHome" });
    })
    .catch(() => {
      validate2F.value = false;
      errorCount.value++;
      if (errorCount.value > 5) {
        router.push({ name: "UnAuthorized" });
      }
    });
}
</script>
