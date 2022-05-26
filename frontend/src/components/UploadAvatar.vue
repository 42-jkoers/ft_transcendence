<template>
  <div>
    <FileUpload
      name="demo[]"
      url="http://localhost:3000/user"
      accept="image/*"
      :maxFileSize="1000000"
      :fileLimit="1"
      chooseLabel="Choose Avatar"
      uploadLabel="Upload"
      @upload="onUpload"
    />
  </div>
</template>
<script setup lang="ts">
import FileUpload from "primevue/fileupload";
function onUpload() {
  console.log("YES!");
}
</script>
