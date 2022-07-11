<template>
  <div>
    <h2>Welcome to our pong place. Meet other people and play pong together</h2>
  </div>
  <div class="card">
    <div class="flex justify-content-center flex-wrap card-container mt-4">
      <Button
        @click="goToChat"
        label="Chat with people"
        class="flex align-items-center justify-content-center border-round m-4"
      />
      <Button
        @click="goToGame"
        label="Play Pong"
        class="flex align-items-center justify-content-center border-round m-4"
      />
    </div>
  </div>
</template>
<script setup lang="ts">
import Button from "primevue/button";
import { useRouter } from "vue-router";

const router = useRouter();
const goToChat = () => {
  router.push({
    name: "Chat",
  });
};
const goToGame = () => {
  router.push({
    name: "Game",
  });
};
</script>
<style>
h2 {
  color: rgb(203, 206, 208);
}
</style>
