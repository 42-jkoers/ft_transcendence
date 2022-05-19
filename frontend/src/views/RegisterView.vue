<template>
  <div class="register-view">
    <RegisterForm />
  </div>
</template>
<script lang="ts">
import { Options, Vue } from "vue-class-component";
import RegisterForm from "@/components/RegisterForm.vue";

@Options({
  components: {
    RegisterForm,
  },
})
export default class RegisterView extends Vue {}
</script>
<style scoped></style>
