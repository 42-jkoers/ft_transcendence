<template>
  <Button label="Scan a QR code" @click="generateQR" />
  <br />
  <br />
  <br />
  <br />
  <img :src="image" />
  <br />
  <br />
  <br />
  <br />
  <Button
    v-if="loadPicture"
    label="Google authenticator added! Go to the validation step"
    class="p-button-success"
    @click="validate2F"
  />
</template>
<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import axios from "axios";
import router from "@/router";
const image = ref();
const loadPicture = ref(false);
async function generateQR() {
  console.log("test");
  await axios
    .get("http://localhost:3000/two-factor-auth/generate", {
      withCredentials: true,
      responseType: "blob",
    })
    .then((response) => {
      loadPicture.value = true;
      let blob = new Blob([response.data], {
        type: response.headers["content-type"],
      });
      image.value = URL.createObjectURL(blob);
      return image;
    })
    .catch((error) => {
      //TODO finalize the error population
      console.error("There was an error in QR codee generation!", error);
    });
}

function validate2F() {
  router.push({ name: "2fAuthenticate" });
}
</script>
