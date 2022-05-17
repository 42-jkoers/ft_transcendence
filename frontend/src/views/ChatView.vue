<template>
  <div class="card">
    <h2>Chat</h2>
    <div class="grid">
      <div class="col-12">
        <div class="grid">
          <div class="col-12 md:col-6 xl:col-6">
            <ChatRooms />
          </div>
          <div class="col-12 md:col-6 xl:col-6">
            <ChatBox />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Options, Vue } from "vue-class-component";
import ChatRooms from "@/components/ChatRooms.vue";
import ChatBox from "@/components/ChatBox.vue"; // @ is an alias to /src

@Options({
  components: {
    ChatRooms,
    ChatBox,
  },
})
export default class ChatView extends Vue {}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
