<template>
  <p class="message">This is the game page</p>
  <form class="form" @submit.prevent="onSubmit">
    <span class="p-float-label">
      <InputText
        id="game-name"
        type="text"
        class="game-name-input"
        v-model="newGameName"
        required="true"
        maxlength="64"
        @keyup.enter="createGame"
      />
      <small v-if="!isValidGameName" id="game-name" class="p-error">{{
        invalidGameNameResponseMessage
      }}</small>
    </span>
    <div class="input-group-append">
      <button class="send-button" @click="createGame">Create game</button>
    </div>
  </form>
</template>

<script setup lang="ts">
import { inject, onMounted, ref } from "vue";
import { Socket } from "socket.io-client";
import InputText from "primevue/inputtext";

const socket: Socket = inject("socketioInstance");
// const games: ref<Array<GameI>>([]);

const newGameName = ref<string>("");
const isValidGameName = ref<boolean>(true);
const invalidGameNameResponseMessage = ref<string>("");
socket.on("BadRequestException", (response) => {
  isValidGameName.value = false;
  invalidGameNameResponseMessage.value = response.message[0];
});

onMounted(() => {
  console.log("mounted");
});

function createGame() {
  console.log("createGame", newGameName.value);
  socket.emit("createGame", { name: newGameName.value });
}
</script>
