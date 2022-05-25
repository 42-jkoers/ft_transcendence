<template>
  <div class="home">
    <h3>"Welcome to Our Pong App"</h3>
    <div v-if="storeUser.state.isAuthenticated">
      <Button>
        <router-link to="/userhome" style="text-decoration: none">
          User Home
        </router-link>
      </Button>
    </div>
    <div v-else>
      <LogInButton />
    </div>
  </div>
</template>

<script setup lang="ts">
import LogInButton from "@/components/LogInButton.vue";
import storeUser from "@/store";
import Button from "primevue/button";
</script>
