<template>
  <div class="home">
    <h3>"Welcome new user! Please register!"</h3>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";

@Options({
  components: {
    //nothing atm
  },
})
export default class HomeView extends Vue {}
</script>
