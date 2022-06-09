<template>
  <div>
    <div v-if="$route.name === 'Create-chatroom'">
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
              <router-view></router-view>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
//TODO align and add flex to ChatRoomsList and ChatBox

<script setup lang="ts">
import { onMounted, inject } from "vue";
import { useRouter } from "vue-router";
import { Socket } from "socket.io-client";

import ChatRoomsList from "../components/ChatRoomsList.vue";
import CreateRoom from "./CreateRoomView.vue";
import PrimeVueButton from "primevue/button";

const socket: Socket = inject("socketioInstance");

onMounted(() => {
  socket.on("rooms", (args: string) => {
    args;
  }); //to get all rooms of the user?

  socket.on("messages", (args: string) => {
    args;
  }); //to get all messages of the user for this room?
});

const router = useRouter();
function openCreateRoomCard() {
  router.push({
    name: "Create-chatroom", // FIXME : temporarily pushing back to chat
  });
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card {
  padding: 0.25rem;
  border-color: aliceblue;
  border-radius: 1rem;
}
.p-button-primary {
  margin: 1.5rem 0rem;
}
</style>
