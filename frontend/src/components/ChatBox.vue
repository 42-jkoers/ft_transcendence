<template>
  <div>
    <Panel>
      {{ $route.params.roomName }}
    </Panel>
    <div
      id="all-messages"
      class="flex flex-column-reverse gap-1 md:gap-2 xl:gap-4"
    >
      <div
        class="message-item flex align-items-start py-2"
        v-for="m in messages"
        :key="m.id"
      >
        <Card class="message-card text-black-alpha-70">
          <template #title>
            <Chip
              :label="m.user.username"
              :image="storeUser.state.user.avatar"
            />
          </template>
          <template #subtitle>
            <p class="card-title">
              {{ moment(m.created_at).format("lll") }}
            </p>
          </template>
          <template #content>
            <p class="card-content">
              {{ m.text }}
            </p>
          </template>
        </Card>
      </div>
    </div>
    <div id="input-field" class="card col-12">
      <div
        class="flex justify-content-center align-items-strech flex-wrap card-container"
      >
        <InputText
          type="text"
          v-model.trim="input"
          placeholder="Type your message..."
          @keyup.enter="sendMessage"
          class="w-11"
        >
        </InputText>
        <PrimeVueButton
          @click="sendMessage"
          icon="pi pi-send"
          class="p-button-primary w-1"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue";
import { Socket } from "socket.io-client";
import MessageI from "../types/Message.interface";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import PrimeVueButton from "primevue/button";
import Panel from "primevue/panel";
import { useRoute } from "vue-router";
import moment from "moment";
import Chip from "primevue/chip";
import storeUser from "@/store";

const socket: Socket = inject("socketioInstance");
const messages = ref<Array<MessageI>>([]);
const input = ref<string>("");
const route = useRoute();

onMounted(() => {
  socket.emit("getMessagesForRoom", route.params.roomName); //emit to load once it's mounted

  socket.on("getMessagesForRoom", (response) => {
    messages.value = response;
  }); //listen to an event for updated messages from backend

  socket.on("messageAdded", (message: MessageI) => {
    socket.emit("getMessagesForRoom", route.params.roomName); //TODO discuss this approach of updating messages
  }); //load msgs again when a msg is sent
});

//binding a click event listener to a method named 'sendMessage'
function sendMessage() {
  if (input.value)
    socket.emit("addMessage", {
      text: input.value,
      room: { name: route.params.roomName },
    });
  input.value = "";
}
</script>

<style scoped>
#all-messages {
  height: 50vh; /*if there is no height it does not scroll */
  overflow-y: scroll; /* FIXME school computer shows white bars */
}

.message-card {
  background: #9da3d2;
}

.card-title {
  font-size: small;
  margin-bottom: 0;
  text-align: left;
  margin-top: 0;
}

.card-content {
  text-align: left;
  font-size: small;
  margin: 0;
}
</style>
