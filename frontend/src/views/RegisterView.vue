<template>
  <div class="register-view">
    <p class="form-title">Register New User</p>
    <form class="form">
      <InputUserName />
      <br />
    </form>
    <button class="button">register</button>
  </div>
</template>
<script lang="ts">
import { Options, Vue } from "vue-class-component";
import InputUserName from "@/components/InputUserName.vue";

@Options({
  components: {
    InputUserName,
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
.button {
  color: green;
}
</style>
