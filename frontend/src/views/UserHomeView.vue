<template>
  <HomeMenu />
  <router-view></router-view>
</template>

<script lang="ts">
import HomeMenu from "@/components/HomeMenu.vue";
export default { components: { HomeMenu } };
</script>
