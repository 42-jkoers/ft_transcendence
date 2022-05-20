<template>
  <p class="form-title">Update User Profile</p>
  <UpdateUserName />
  <br />
  <UpdateAvatar />
</template>
<script lang="ts">
import { Options, Vue } from "vue-class-component";
import UpdateUserName from "@/components/UpdateUserName.vue";
import UpdateAvatar from "@/components/UpdateAvatar.vue";

@Options({
  components: {
    UpdateUserName,
    UpdateAvatar,
  },
})
export default class RegisterView extends Vue {}
</script>
<style scoped>
.form-title {
  color: darkcyan;
  font-size: large;
  font-weight: 600;
}
</style>
