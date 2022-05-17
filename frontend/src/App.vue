<template>
  <div id="nav">
    <router-link to="/">
      Home
    </router-link> |
    <router-link to="/chat">
      Chat
    </router-link> |
    <a href="http://localhost:3000/auth/login">
      Login
    </a>
    <router-view />
  </div>
</template>

<script lang="ts">
export default {
  name: 'App',
  components: {
  },
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
