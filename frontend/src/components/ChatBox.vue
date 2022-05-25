<template>
  <div id="chatbox" class="flex flex-column">
    <div
      id="all-messages"
      class="flex flex-column-reverse gap-1 md:gap-2 xl:gap-4"
    >
      <ScrollPanel ref="root" style="width: 100%; height: 1000px">
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
import { ref, inject, onMounted, onUpdated } from "vue";
import { Socket } from "socket.io-client";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import PrimeVueButton from "primevue/button";
import ScrollPanel from "primevue/scrollpanel";
import MessageI from "../types/Message.interface";

const socket: Socket = inject("socketioInstance");
const messages = ref<Array<MessageI>>([]);
const input = ref<string>("");
const root = ref(null);

onMounted(() => {
  socket.on("messageAdded", (message: MessageI) => {
    console.log("messageAdded event received from backend");
    console.log("Here is you msg saved to DB: ", message.text);
    messages.value.push(message);
    console.log(messages.value);
    const scrollpanelTop = root.value.scrollTop;
    // scrollpanel.scrollTop = scrollpanel.scrollHeight;
    const scrollpanelHeight = root.value.scrollHeight;
    console.log("top ", scrollpanelTop);
    console.log("height ", scrollpanelHeight);
  }); //event triggered when a msg is saved to DB
});

// onUpdated(() => {
//   const scrollpanel = root.value;
//   scrollpanel.scrollTop = scrollpanel.scrollHeight;
//   console.log("Root ", scrollpanel.scrollTop, scrollpanel.scrollHeight);
// });

//binding a click event listener to a method named 'sendMessage'
function sendMessage() {
  console.log("input value: ", input.value);
  socket.emit("addMessage", { text: input.value });
  input.value = "";
}
</script>

<style scoped>
.message-card {
  background: #9da3d2;
}
</style>
