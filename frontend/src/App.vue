<template>
  <div>
    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/chat">Chat</router-link> |
      <router-link to="/login">Login</router-link> |
      <!-- <a href="http://localhost:3000/auth/login"> Login </a> | -->
      <router-link to="/update-profile">UpdateProfile</router-link> |
      <router-link to="/logout">Logout</router-link>
    </nav>
    <router-view />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}

body {
  margin: 0;
  height: 100%;
  overflow-x: hidden;
  overflow-y: auto;
  /* background-color: var(--surface-a);
    font-family: var(--font-family);
    font-weight: 400;
    color: var(--text-color); */
}
</style>
