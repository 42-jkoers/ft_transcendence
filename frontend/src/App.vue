<template>
    <div id="nav">
        <router-link to="/"> Home </router-link> |
        <router-link to="/chat"> Chat </router-link>
        <router-view />
    </div>
</template>

<script lang="ts">
export default {
    name: "App",
    components: {},
};
</script>
<style>
#app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    /* color: #ffffff; */
    margin-top: 60px;
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
