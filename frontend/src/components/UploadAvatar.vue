<template>
  <div align="left">
    <div
      v-for="category of avatarSources"
      :key="category.key"
      class="field-radiobutton"
    >
      <RadioButton
        :id="category.key"
        name="category"
        :value="category"
        v-model="selectedAvatarSource"
        @change="changeAvatarSource"
      />
      <label :for="category.key" class="radio-label">{{ category.name }}</label>
    </div>
  </div>
  <div v-if="isLoading">
    <ProgressSpinner
      style="width: 50px; height: 50px"
      strokeWidth="8"
      fill="var(--surface-ground)"
      animationDuration=".5s"
    />
  </div>
  <div align="left" v-if="isUploadSelected">
    <input type="file" @change="onFileSelected" />
    <button @click="onUpload">Upload</button>
  </div>
  <div align="left">
    <Message v-if="isUploadSuccess" severity="success" :closable="false">
      Upload successful!
    </Message>
    <Message v-if="isAvatarInvalid" severity="error" :closable="false">
      {{ invalidAvatarMessage }}
    </Message>
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits } from "vue";
import axios from "axios";
import ProgressSpinner from "primevue/progressspinner";
import Message from "primevue/message";
import RadioButton from "primevue/radiobutton";
const isUploadSelected = ref<boolean>(true);
const isLoading = ref<boolean>(false);
const isAvatarInvalid = ref<boolean>(false);
const invalidAvatarMessage = ref<string>("");
const isUploadSuccess = ref<boolean>(false);

const avatarSources = ref([
  { name: "Default Avatar", key: "D" },
  { name: "Upload My Own Avatar", key: "U" },
]);
const selectedAvatarSource = ref(avatarSources.value[1]);

const emit = defineEmits<{
  (event: "newAvatar"): string;
  (event: "avatarSource"): string;
}>();

function changeAvatarSource() {
  if (selectedAvatarSource.value.key === "U") {
    isUploadSelected.value = true;
    emit("avatarSource", "current");
  } else {
    isUploadSelected.value = false;
    emit("avatarSource", "default");
  }
}

const selectedFile = ref(null);
function onFileSelected(event) {
  selectedFile.value = event.target.files[0];
}

function isFileValid() {
  if (!selectedFile.value) {
    invalidAvatarMessage.value = "Please choose an image.";
    return false;
  }
  const fileSize = selectedFile.value.size;
  if (fileSize > 1000000) {
    invalidAvatarMessage.value =
      "File size is too big. (Please upload file less than 1MB.)";
    return false;
  } else if (
    selectedFile.value.type.indexOf("jpeg") === -1 &&
    selectedFile.value.type.indexOf("png") === -1
  ) {
    invalidAvatarMessage.value =
      "File type is not allowed. (Please upload only JPEG or PNG image.)";
    return false;
  }
  return true;
}

function showErrorMessage() {
  isAvatarInvalid.value = true;
  setTimeout(() => (isAvatarInvalid.value = false), 2000);
}

function showSuccessMessage() {
  isUploadSuccess.value = true;
  setTimeout(() => (isUploadSuccess.value = false), 2000);
}

async function onUpload() {
  if (isFileValid()) {
    isLoading.value = true;
    const formData = new FormData();
    formData.append("file", selectedFile.value, selectedFile.value.name);
    try {
      const response = await axios.post(
        "http://localhost:3000/user/avatar",
        formData,
        {
          withCredentials: true,
        }
      );
      // once saving new image to local drive, vue serve will reload
      // so here we wait for a while to send signal so parent component could be able to find the saved image
      setTimeout(() => {
        emit("newAvatar", response.data);
        isLoading.value = false;
        showSuccessMessage();
      }, 2000);
    } catch (error) {
      invalidAvatarMessage.value = "Upload error. Please try again.";
      showErrorMessage();
    }
  } else {
    showErrorMessage();
  }
}
</script>
<style scoped>
.radio-label {
  padding-right: 12px;
  font-weight: 400;
}
</style>
