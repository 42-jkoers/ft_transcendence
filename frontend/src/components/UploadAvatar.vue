<!-- <template>
  <div>
    <FileUpload
      name="demo[]"
      url="http://localhost:3000/user/avatar"
      accept="image/*"
      :maxFileSize="1000000"
      :fileLimit="1"
      chooseLabel="Choose Avatar"
      uploadLabel="Upload"
      @upload="onUpload"
    />
  </div>
</template> -->
<template>
  <div>
    <input type="file" @change="onFileSelected" />
    <button @click="onUpload">Upload</button>
  </div>
  <div align="left">
    <small v-if="isAvatarInvalid" class="p-error"
      >{{ invalidAvatarMessage }}
    </small>
  </div>
</template>
<script setup lang="ts">
import { ref, defineEmits } from "vue";
import axios from "axios";
const isAvatarInvalid = ref<boolean>(false);
const invalidAvatarMessage = ref<string>("");

const emit = defineEmits<{
  (event: "newAvatar"): string;
}>();

const selectedFile = ref(null);
function onFileSelected(event) {
  selectedFile.value = event.target.files[0];
}

// TODO: review file size limit
function isFileValid() {
  if (!selectedFile.value) {
    invalidAvatarMessage.value = "Please choose an image.";
    return false;
  }
  const fileSize = selectedFile.value.size;
  if (fileSize > 1000000) {
    invalidAvatarMessage.value = "File size is too big.";
    return false;
  } else if (
    selectedFile.value.type.indexOf("jpeg") === -1 &&
    selectedFile.value.type.indexOf("png") === -1
  ) {
    invalidAvatarMessage.value = "File type is not allowed.";
    return false;
  }
  return true;
}

function showErrorMessage() {
  isAvatarInvalid.value = true;
  setTimeout(() => (isAvatarInvalid.value = false), 2000);
}

async function onUpload() {
  if (isFileValid()) {
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
      setTimeout(() => emit("newAvatar", response.data), 2000);
    } catch (error) {
      invalidAvatarMessage.value = "Upload error. Please try again.";
      showErrorMessage();
    }
  } else {
    showErrorMessage();
  }
}
</script>
