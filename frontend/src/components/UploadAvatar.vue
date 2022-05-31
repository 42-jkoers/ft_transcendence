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
</template>
<script setup lang="ts">
import { ref } from "vue";
import axios from "axios";
// import FileUpload from "primevue/fileupload";
const selectedFile = ref(null);
function onFileSelected(event) {
  selectedFile.value = event.target.files[0];
}
async function onUpload() {
  const formData = new FormData();
  formData.append("file", selectedFile.value, selectedFile.value.name);
  console.log("form data has a file field: ", formData.get("file"));
  const response_post = await axios.post(
    "http://localhost:3000/user/avatar",
    formData,
    {
      withCredentials: true,
    }
  );
  console.log("get response: ", response_post);
}
</script>
