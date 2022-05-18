<template>
  <div class="card">
    <form class="form" @submit.prevent="onSubmit">
      <input
        v-model="input"
        placeholder="Type your message..."
        class="input"
        @keyup.enter="sendMessage"
      />
      <div class="input-group-append">
        <button class="send-button" @click="sendMessage">Send</button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import SocketioService from "../services/socketio.service";
import { ref, onMounted, onBeforeUnmount } from "vue";

onMounted(() => {
  const socket = SocketioService.setupSocketConnection(); //create a socket instance for connecting client

  // event listeners for the socket instance //
  // making use of on() to register an event listener //
  socket.on("rooms", (args: string) => {
    args;
  }); //to get all rooms of the user?

  socket.on("messages", (args: string) => {
    args;
  }); //to get all messages of the user for this room?

  socket.on("messageAdded", (args: string) => {
    console.log("messageAdded event received from backend");
    // this.messages.push(args);
    // this.messages.push(this.input);
    // console.log("MEssages: ", this.messages);
  }); //listen to an event coming from the backend gateway for msg sent?
});

onBeforeUnmount(() => {
  SocketioService.disconnect();
});

// reactive state
const input = ref<string>("");

//binding a click event listener to a method named 'sendMessage'
function sendMessage(args: string) {
  args;
  console.log("input value: ", input.value);
  SocketioService.release("addMessage", `Your input value was ${input.value}`);
}
</script>
