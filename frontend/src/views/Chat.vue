<template>
<div class="container">
    <form @submit.prevent="onSubmit" class="form">
    <textarea v-model="input" placeholder="Type your message..." class="input" />
    <div class="input-group-append">
         <button class="send-button">Send</button>
    </div>
    </form>
  </div>
</template>

<script>
import { io } from 'socket.io-client';

export default {
    name: "ChatPage",
    data() {
        return {
            msg: "Welcome to our Chat",
        };
    },

    mounted() {
        this.socket = io('http://localhost:3000');
    },

    beforeUnmount() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

       //register a catch-all listener -> useful during development:
    // this.socket.onAny((event, ...args) => {
    //   console.log(event, args);
    // })
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
