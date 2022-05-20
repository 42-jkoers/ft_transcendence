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
import { onMounted, onBeforeUnmount, ref, provide } from "vue";
import ChatRooms from "@/components/ChatRooms.vue";
import ChatBox from "@/components/ChatBox.vue"; // @ is an alias to /src
import SocketioService from "../services/socketio.service";
import MessageI from "../types/Message.interface";

const socket = SocketioService.setupSocketConnection(); //create a socket instance for connecting client

onMounted(() => {
  socket.on("rooms", (args: string) => {
    args;
  }); //to get all rooms of the user?

  socket.on("messages", (args: string) => {
    args;
  }); //to get all messages of the user for this room?

  socket.on("messageAdded", (message: MessageI) => {
    console.log("messageAdded event received from backend");
    console.log("Here is you msg saved to DB: ", message.text);
  }); //event triggered when a msg is saved to DB
});

onBeforeUnmount(() => {
  socket.disconnect();
});

// reactive input state
const input = ref<string>("");
//binding a click event listener to a method named 'sendMessage'
function sendMessage() {
  console.log("input value: ", input.value);
  socket.emit("addMessage", { text: input.value });
}
provide("socketioInstance", socket); // dependency provider of socketio instance for all its descendants
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
