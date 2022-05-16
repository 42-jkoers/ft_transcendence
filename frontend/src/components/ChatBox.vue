<template>
    <div class="card">
        <h5>Messages</h5>
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
import { io } from "socket.io-client";

export default {
    name: "ChatBox",
    data() {
        return {
            msg: "Welcome to our Chat",
            messages: [],
        };
    },

    mounted() {
        this.socket = io("http://localhost:3000"); //create a socket instance for connecting client

        // event listeners for the socket instance //
        // making use of on() to register an event listener //
        this.socket.on("rooms", (args) => {
            args;
        }); //to get all rooms of the user?

        this.socket.on("messages", (args) => {
            args;
        }); //to get all messages of the user for this room?

        this.socket.on("messageAdded", (args) => {
            console.log("messageAdded event received from backend");
            this.messages.push(args);
        }); //listen to an event coming from the backend gateway for msg sent?
    },

    beforeUnmount() {
        if (this.socket) {
            this.socket.disconnect();
        }
    },

    methods: {
        //binding a click event listener to a method named 'sendMessage'
        sendMessage(args) {
            console.log("Send button clicked!");
            args;
            console.log(this.input);
            this.socket.emit("addMessage", "Msg: Send button clicked!");
        },
    },
};
</script>
