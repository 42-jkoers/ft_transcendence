<template>
  <p class="form-title">Update User Profile</p>
  <UpdateUserName />
  <br />
  <UpdateAvatar />
</template>
<script lang="ts">
import UpdateUserName from "@/components/UpdateUserName.vue";
import UpdateAvatar from "@/components/UpdateAvatar.vue";
export default {
  components: {
    UpdateUserName,
    UpdateAvatar,
  },
};
</script>
<style scoped>
.form-title {
  color: darkcyan;
  font-size: large;
  font-weight: 600;
}
</style>
