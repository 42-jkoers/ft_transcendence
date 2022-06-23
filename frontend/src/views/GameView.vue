<template>
  <p class="message">This is the game page</p>
  <form class="form" @submit.prevent="onSubmit">
    <input
      v-model="input"
      placeholder="Create a game..."
      class="input"
      @keyup.enter="createGame"
    />
    <div class="input-group-append">
      <button class="send-button" @click="createGame">Create room</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { inject, onMounted } from "vue";
import { Socket } from "socket.io-client";

const socket: Socket = inject("socketioInstance");
// const games: ref<Array<GameI>>([]);

onMounted(() => {
  console.log("mounted");
});
function createGame() {
  console.log("createGame");
  socket.emit("gameStarted", { name: `game at ${new Date().toISOString()}` });
}
</script>
