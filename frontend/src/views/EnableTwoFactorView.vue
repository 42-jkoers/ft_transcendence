<template>
  <!-- <Button label="Scan a QR code" @click="generateQR" /> -->
  <Button label="Scan a QR code" class="p-button-info" @click="generateQR" />
  <br />
  <br />
  <br />
  <img :src="image" />
  <br />
  <br />
  <br />
  <Button
    v-if="loadPicture"
    label="Google authenticator added! Go to the validation step"
    class="mr-2"
    icon="pi pi-check"
    @click="validate2F"
  />
</template>
<script setup lang="ts">
import { ref } from "vue";
import Button from "primevue/button";
import axios from "axios";
import router from "@/router";
import { useToast } from "primevue/usetoast";
import ConfirmationService from "primevue/confirmationservice";
import { useConfirm } from "primevue/useconfirm";

const image = ref();
const loadPicture = ref(false);
const toast = useToast();
const confirm = useConfirm();

async function generateQR() {
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
      sendWrarning();
      return image;
    })
    .catch((error) => {
      //TODO finalize the error population
      console.error("There was an error in QR codee generation!", error);
    });
}

async function validate2F() {
  await confirm1();
  router.push({ name: "2fAuthenticate" });
}

function sendWrarning() {
  toast.add({
    severity: "info",
    summary: "Warn message",
    detail:
      "Please make sure you scan the QR code and add to your Google Authenticator before you leave the page!",
    life: 10000,
  });
}

function confirm1() {
  confirm.require({
    message: "Are you sure you want to proceed?",
    header: "Confirmation",
    icon: "pi pi-exclamation-triangle",
    accept: () => {
      toast.add({
        severity: "info",
        summary: "Confirmed",
        detail: "You have processed",
        life: 3000,
      });
    },
    reject: () => {
      toast.add({
        severity: "info",
        summary: "Confirmed",
        detail: "You have rejected",
        life: 3000,
      });
      router.push({ name: "enableTwoFactor" });
    },
  });
}
</script>
