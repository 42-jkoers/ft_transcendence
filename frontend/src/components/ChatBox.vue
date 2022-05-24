<template>
  <div id="chatbox">
    <div id="all-messages" class="flex flex-column gap-1 md:gap-2 xl:gap-4">
      <div
        class="message-item flex align-items-start"
        v-for="m in messages"
        :key="m.id"
      >
        <Card class="message-card">
          <template v-slot:content>
            {{ m.text }}
          </template>
          <!-- <template #footer class="message-date">{{ m.date }}</template> -->
        </Card>
      </div>
    </div>
    <Card>
      <template #footer>
        <div id="input-field" class="card">
          <div
            class="flex justify-content-center align-items-end flex-wrap card-container"
          >
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
const messages = ref<Array<MessageI>>([]);
const input = ref<string>("");

onMounted(() => {
  socket.on("messageAdded", (message: MessageI) => {
    console.log("messageAdded event received from backend");
    console.log("Here is you msg saved to DB: ", message.text);
    messages.value.push(message);
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
<style scoped>
.chatbox {
  align-self: baseline;
}
</style>
