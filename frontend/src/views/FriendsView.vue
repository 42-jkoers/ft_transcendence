<template>
  <div class="grid">
    <div class="col-4" align="center">
      <FriendRequest />
    </div>
    <div class="col-8" align="center">
      <FriendList />
    </div>
  </div>
</template>
<script setup lang="ts">
import FriendRequest from "@/components/FriendRequest.vue";
import FriendList from "@/components/FriendList.vue";
</script>
<style scoped></style>
