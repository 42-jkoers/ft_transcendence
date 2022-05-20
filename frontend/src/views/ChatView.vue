<template>
  <div class="card">
    <h2>Chat</h2>
    <div class="grid">
      <div class="col-12">
        <div class="grid">
          <div class="col-12 md:col-6 xl:col-6">
            <ChatRooms />
          </div>
          <div class="col-12 md:col-6 xl:col-6">
            <ChatBox />
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
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from "vue";
import ChatRooms from "@/components/ChatRooms.vue";
import ChatBox from "@/components/ChatBox.vue"; // @ is an alias to /src
import SocketioService from "../services/socketio.service";

const socket = SocketioService.setupSocketConnection(); //create a socket instance for connecting client
// reactive state
const input = ref<string>("");

onMounted(() => {
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
  socket.disconnect();
  //SocketioService.disconnect(); //FIXME I can access socket directly. Which one should we use?
});

//binding a click event listener to a method named 'sendMessage'
function sendMessage() {
  console.log("input value: ", input.value);
  socket.emit("addMessage", `Your input value was ${input.value}`);
  //SocketioService.release("addMessage", `Your input value was ${input.value}`);
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
