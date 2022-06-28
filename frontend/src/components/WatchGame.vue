<template>This is Watch Game</template>
<script setup lang="ts">
import axios from "axios";
import { onMounted } from "vue";

onMounted(async () => {
  await axios
    .get("http://localhost:3000/game/list", { withCredentials: true })
    .then((response) => {
      console.log("game list: ", response.data);
    })
    .catch();
});
</script>
