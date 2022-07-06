<template>
  <div class="grid">
    <div class="col-4">
      <WatchGame />
    </div>
    <div class="col-4">
      <JoinGameQueueAuto />
    </div>
    <div class="col-4">
      <GameInvite />
    </div>
  </div>
</template>
<script setup lang="ts">
import JoinGameQueueAuto from "@/components/JoinGameQueueAuto.vue";
import WatchGame from "@/components/WatchGame.vue";
import GameInvite from "@/components/GameInvite.vue";
</script>
