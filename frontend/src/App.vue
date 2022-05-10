<template>
    <div id="nav">
        <router-link to="/">Home</router-link> |
        <router-link to="/chat">Chat</router-link>
        <router-view />
    </div>
</template>

<script>
// import ChatApp from './components/chat/ChatApp.vue'
import SocketioService from './services/socketio.service.js';

export default {
  name: 'App',
  components: {
  },
  created() {
    SocketioService.setupSocketConnection();
  },
  beforeUnmount() {
    SocketioService.disconnect();
  }
};
</script>

<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    margin-top: 60px;
}
</style>
