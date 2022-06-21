<template>
  <div class="grid">
    <div class="col-6" align="center">
      <FriendRequest />
    </div>
    <div class="col-6" align="center">
      <FriendList />
    </div>
  </div>
</template>
<script setup lang="ts">
import FriendRequest from "@/components/FriendRequest.vue";
import FriendList from "@/components/FriendList.vue";
</script>
<style scoped></style>
