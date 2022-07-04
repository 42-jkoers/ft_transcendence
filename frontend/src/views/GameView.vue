<template>
  <div class="grid">
    <div class="col-4">
      <WatchGame />
    </div>
    <div style="margin: 0 auto">
      <JoinGame />
    </div>
  </div>
</template>
<script setup lang="ts">
import JoinGame from "@/components/JoinGame.vue";
import WatchGame from "@/components/WatchGame.vue";
</script>
