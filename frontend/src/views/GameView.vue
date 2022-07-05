<template>
  <div class="grid">
    <div class="col-4">
      <WatchGame />
    </div>
    <div class="col-4">
      <GameInvite />
    </div>
    <div class="col-4">
      <JoinGameQueueManual />
    </div>
  </div>
</template>
<script setup lang="ts">
import JoinGameQueueManual from "@/components/JoinGameQueueManual.vue";
import WatchGame from "@/components/WatchGame.vue";
import GameInvite from "@/components/GameInvite.vue";
</script>
