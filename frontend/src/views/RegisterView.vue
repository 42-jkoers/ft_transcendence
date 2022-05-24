<template>
  <p class="form-title">Register New User</p>
  <UpdateUserName @updateUserName="redirectToHome($event)" />
</template>
<script lang="ts">
import UpdateUserName from "@/components/UpdateUserName.vue";
import router from "@/router";
import store from "@/store";
export default {
  components: {
    UpdateUserName,
  },
  methods: {
    redirectToHome(e: boolean) {
      if (e) {
        setTimeout(() => router.push({ name: "LogInState" }), 1000);
      }
    },
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
