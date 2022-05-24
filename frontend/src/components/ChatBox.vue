<template>
  <div id="chatbox">
    <Card>
      <template v-slot:content>
        <div class="card">
          <div class="flex justify-content-center flex-wrap card-container">
            <InputText
              type="text"
              v-model="input"
              placeholder="Type your message..."
              @keyup.enter="sendMessage"
            >
            </InputText>
            <PrimeVueButton
              @click="sendMessage"
              icon="pi pi-send"
              class="p-button-primary"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue";
import { Socket } from "socket.io-client";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import PrimeVueButton from "primevue/button";
import MessageI from "../types/Message.interface";

const socket: Socket = inject("socketioInstance");
//TODO Should input text and button be inside a form tag?

// reactive states
const messages = ref([]); //TODO type of array?
const input = ref<string>("");

onMounted(() => {
  socket.on("messageAdded", (message: MessageI) => {
    console.log("messageAdded event received from backend");
    console.log("Here is you msg saved to DB: ", message.text);
    messages.value.push(message.text);
    console.log(messages.value);
  }); //event triggered when a msg is saved to DB
});

//binding a click event listener to a method named 'sendMessage'
function sendMessage() {
  console.log("input value: ", input.value);
  socket.emit("addMessage", { text: input.value });
  input.value = "";
}
</script>
