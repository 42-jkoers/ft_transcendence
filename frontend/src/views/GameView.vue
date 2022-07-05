<template>
  <div class="grid">
    <div class="col-4">
      <WatchGame />
    </div>
    <div class="col-4">
      <GameInvite />
    </div>
    <div class="col-4">
      <JoinGameQueue />
    </div>
  </div>
</template>
<script setup lang="ts">
import JoinGameQueue from "@/components/JoinGameQueue.vue";
import WatchGame from "@/components/WatchGame.vue";
import GameInvite from "@/components/GameInvite.vue";
</script>
