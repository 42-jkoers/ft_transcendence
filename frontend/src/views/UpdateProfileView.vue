<template>
  <p class="form-title">Update User Profile</p>
  <UpdateProfile_UserName />
  <br />
  <UpdateProfile_Avatar />
</template>
<script lang="ts">
import { Options, Vue } from "vue-class-component";
import UpdateProfile_UserName from "@/components/UpdateProfile_UserName.vue";
import UpdateProfile_Avatar from "@/components/UpdateProfile_Avatar.vue";

@Options({
  components: {
    UpdateProfile_UserName,
    UpdateProfile_Avatar,
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
