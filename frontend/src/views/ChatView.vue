<template>
  <div>
    <div v-if="this.$route.name === 'create-chatroom'">
      <CreateRoom />
    </div>
    <div v-else class="card">
      <div class="grid">
        <div class="col-12">
          <div class="grid">
            <div class="col-12 md:col-4 xl:col-3">
              <PrimeVueButton
                @click="openCreateRoomCard"
                label="New Chat Room"
                icon="pi pi-plus"
                class="p-button-primary"
              />
              <ChatRoomsList />
            </div>
            <div class="col-12 md:col-8 xl:col-9">
              <ChatBox />
            </div>
          </div>
        </div>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>
//TODO align and add flex to ChatRoomsList and ChatBox

<script setup lang="ts">
import { onMounted, inject } from "vue";
import { useRouter } from "vue-router";
import { Socket } from "socket.io-client";

import ChatRoomsList from "../components/ChatRoomsList.vue"; //TODO: update tsconfig and change to @
import ChatBox from "../components/ChatBox.vue"; // @ is an alias to /src
import CreateRoom from "./CreateRoom.vue"; // Vetur still doesn't support script setup so is unhappy
// import SocketioService from "../services/socketio.service";
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
});

function openCreateRoomCard() {
  router.push({
    name: "create-chatroom", // FIXME : temporarily pushing back to chat
  });
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
