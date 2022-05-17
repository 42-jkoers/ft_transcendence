<template>
  <div class="home">
    <h3>"Welcome to Our Pong App"</h3>
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
