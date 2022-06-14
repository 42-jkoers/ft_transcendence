<template>
  <div class="grid">
    <div class="col-5" align="center">
      <FriendRequest />
    </div>
    <div class="col-7" align="center">
      <FriendList />
    </div>
  </div>
</template>
<script setup lang="ts">
import FriendRequest from "@/components/FriendRequest.vue";
import FriendList from "@/components/FriendList.vue";
</script>
<style scoped></style>
