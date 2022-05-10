<template>
<div class="container">
    <form @submit.prevent="onSubmit" class="form">
    <textarea v-model="input" placeholder="Type your message..." class="input" />
    <div class="input-group-append">
         <button class="send-button" @click="sendMessage">Send</button>
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
        this.socket = io('http://localhost:3000'); //create a socket instance for connecting client

        // event listeners for the socket instance //
        // making use of on() to register an event listener //
        this.socket.on('rooms', (args) => {
            args;
        }) //to get all rooms of the user?

        this.socket.on('messages', (args) => {
            args;
        }) //to get all messages of the user for this room?

        this.socket.on("messageAdded", (args) => {
            args; //this.messages.push(args)
        }) //listen to an event coming from the backend gateway for msg sent?

       //register a catch-all listener -> useful during development:
        this.socket.onAny((event, ...args) => {
            console.log(event, args);
        })
    },

    methods: {
        //binding a click event listener to a method named 'x'
        sendMessage() {
            console.log("Send button clicked!");
            this.socket.emit('addMessage', 'Msg: Send button clicked!');
        }
    },

    beforeUnmount() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
