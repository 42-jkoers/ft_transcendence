<template>
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
</template>

<script lang="ts">
import SocketioService from "../services/socketio.service";
import { defineComponent } from "vue";

export default defineComponent({
  props: {},
  data() {
    return {
      // messages: { type: Array as PropType<Array<string>> },
      msg: "Welcome to our Chat",
    };
  },

  mounted() {
    const socket = SocketioService.setupSocketConnection(); //create a socket instance for connecting client

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
      // this.messages?.push(args);
    }); //listen to an event coming from the backend gateway for msg sent?
  },

  beforeUnmount() {
    SocketioService.disconnect();
  },

  methods: {
    //binding a click event listener to a method named 'sendMessage'
    sendMessage(args: string) {
      console.log("Send button clicked!");
      args;
      // console.log(this.input);
      SocketioService.release(
        "addMessage",
        "Msg: User clicked the Send button!"
      );
    },
  },
});
</script>
