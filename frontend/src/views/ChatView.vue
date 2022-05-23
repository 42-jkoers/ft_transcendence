<template>
  <div>
    <div v-if="this.$route.name === 'create-chatroom'">
      <CreateRoom />
    </div>
    <div v-else class="card">
      <h2>Chat</h2>
      <div class="grid">
        <div class="col-12">
          <div class="grid">
            <div class="col-12 md:col-6 xl:col-6">
              <PrimeVueButton
                @click="openCreateRoomCard"
                label="New Chat Room"
                icon="pi pi-plus"
                class="p-button-primary"
              />
              <ChatRoomsList />
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
                    <button class="send-button" @click="sendMessage">
                      Send
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, inject } from "vue";
import { useRouter } from "vue-router";
import { Socket } from "socket.io-client";

import ChatRoomsList from "../components/ChatRoomsList.vue"; //TODO: update tsconfig and change to @
import ChatBox from "../components/ChatBox.vue"; // @ is an alias to /src
import CreateRoom from "./CreateRoom.vue"; // Vetur still doesn't support script setup so is unhappy
// import SocketioService from "../services/socketio.service";
import MessageI from "../types/Message.interface";
import PrimeVueButton from "primevue/button";

const router = useRouter();
const socket: Socket = inject("socketioInstance");

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

// onBeforeUnmount(() => {
//   socket.disconnect();
// });

// reactive input state
const input = ref<string>("");
//binding a click event listener to a method named 'sendMessage'
function sendMessage() {
  console.log("input value: ", input.value);
  socket.emit("addMessage", { text: input.value });
}

function openCreateRoomCard() {
  router.push({
    name: "create-chatroom", // FIXME : temporarily pushing back to chat
  });
}

// provide("socketioInstance", socket); // dependency provider of socketio instance for all its descendants
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
