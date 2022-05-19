<template>
  <p class="form-title">Register New User</p>
  <UpdateProfile_UserName @updateUserName="redirectToHome($event)" />
</template>
<script lang="ts">
import UpdateProfile_UserName from "@/components/UpdateProfile_UserName.vue";
import router from "@/router";
export default {
  components: {
    UpdateProfile_UserName,
  },
  methods: {
    redirectToHome(e: boolean) {
      if (e) {
        setTimeout(() => router.push("/"), 1000);
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
