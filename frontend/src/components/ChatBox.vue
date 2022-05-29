<template>
  <div id="chatbox" class="flex flex-column">
    <div
      id="all-messages"
      class="flex flex-column-reverse gap-1 md:gap-2 xl:gap-4"
    >
      <ScrollPanel ref="root" style="width: %100; height: 1000px">
        <div
          class="message-item flex align-items-start py-2"
          v-for="m in messages"
          :key="m.id"
        >
          <Card class="message-card text-black-alpha-70">
            <template v-slot:content>
              {{ m.text }}
            </template>
            <!-- <template #footer class="message-date">{{ m.date }}</template> -->
          </Card>
        </div>
      </ScrollPanel>
    </div>
    <div id="input-field" class="card col-12">
      <div
        class="flex justify-content-center align-items-strech flex-wrap card-container"
      >
        <InputText
          type="text"
          v-model="input"
          placeholder="Type your message..."
          @keyup.enter="sendMessage"
          class="w-11"
          required
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
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import PrimeVueButton from "primevue/button";
import ScrollPanel from "primevue/scrollpanel";
import MessageI from "../types/Message.interface";
import Room from "../types/Room";
import UserProfileI from "../types/UserProfile.interface";

const socket: Socket = inject("socketioInstance");
const messages = ref<Array<MessageI>>([]);
const input = ref<string>("");
const root = ref(null);
const exampleRoom: Room = {
  id: 5,
  name: "codam",
  isDirectMessage: true,
  visibility: 1,
};

const exampleUser: UserProfileI = {
  id: 1,
  username: "irem",
  avatar: "av",
};

onMounted(() => {
  socket.emit("getMessagesForRoom", exampleRoom.id);

  socket.on("getMessagesForRoom", (response) => {
    // console.log("Msgs of this room: ", response);
    messages.value = response;
  });

  socket.on("messageAdded", (message: MessageI) => {
    console.log("Here is you msg saved to DB: ", message.text);
    // messages.value.push(message);
    socket.emit("getMessagesForRoom", exampleRoom.id); //TODO discuss this approach of updating messages

    //after each msg adjust scroll height?
    // const x = ref[root];
    // console.log("xx ", x);
    // const scrollpanel = root.value;
    // console.log("PANEL ", scrollpanel);
    // console.log("TEST ", scrollpanel[1]);
    // console.log("Root ", scrollpanel.scrollTop, scrollpanel.scrollHeight);
    // scrollpanel.scrollTop = scrollpanel.scrollHeight;
  }); //event triggered when a msg is saved to DB
});

//binding a click event listener to a method named 'sendMessage'
function sendMessage() {
  input.value = input.value.trim();
  //console.log("user ", socket.id);
  if (input.value)
    socket.emit("addMessage", {
      text: input.value,
      user: exampleUser,
      room: exampleRoom,
    });
  input.value = "";
}
</script>

<style scoped>
.message-card {
  background: #9da3d2;
}
</style>
