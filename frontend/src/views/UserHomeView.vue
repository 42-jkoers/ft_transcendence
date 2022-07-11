<template>
  <div>
    <h3>Welcome to our pong place.</h3>
    <h3>Meet other people and play pong together.</h3>
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
        label="I want to play Pong"
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
h3 {
  color: rgb(203, 206, 208);
}
</style>
