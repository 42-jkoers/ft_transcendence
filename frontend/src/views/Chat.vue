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
import ChatRooms from "../components/ChatRooms.vue";
import ChatBox from "../components/ChatBox.vue";

export default {
    name: "ChatPage",
    components: {
        ChatRooms,
        ChatBox,
    },
};
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped></style>
