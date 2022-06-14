<template>
  <div v-if="isError">
    <Message severity="error" :closable="false">
      Oops, this user does not exist.
    </Message>
  </div>
  <div v-else align="center">
    <div>
      <Card style="width: 30%; margin: 5%; border-radius: 5%; border: Groove">
        <template #header>
          <img :src="user?.avatar" style="width: 90%; margin-top: 5%" />
        </template>
        <template #title>
          <h3>{{ user?.username }}</h3>
          <div v-if="!isSelf">
            <div v-if="isFriend">
              <EditFriendButton
                :friendId="user?.id"
                buttonLabel="Unfriend"
                buttonIcon="pi pi-user-minus"
                :action="EditFriend.REMOVE_FRIEND"
                @processed="changeFriendStatus()"
              />
            </div>
            <div v-else>
              <EditFriendButton
                :friendId="user?.id"
                buttonLabel="Add friend"
                buttonIcon="pi pi-user-plus"
                :action="EditFriend.SEND_REQUEST"
                @processed="changeFriendStatus()"
              />
            </div>
          </div>
        </template>
        <template #content>
          <p>To add content</p>
        </template>
        <template #footer>
          <div v-if="isSelf">
            <Button
              label="Edit Profile"
              class="p-button-rounded p-button-outlined"
              icon="pi pi-user-edit"
              @click="toSetting"
            />
          </div>
          <div v-else>
            <Button
              label="Message"
              class="p-button-rounded p-button-outlined"
              icon="pi pi-envelope"
              @click="toPrivateMessage"
            />
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import axios from "axios";
import Message from "primevue/message";
import Card from "primevue/card";
import Button from "primevue/button";
import UserProfileI from "@/types/UserProfile.interface";
import storeUser from "@/store";
import { useRouter } from "vue-router";
import EditFriendButton from "./EditFriendButton.vue";
import EditFriend from "@/types/EditFriend";

const route = useRoute();
const id = route.params.id;
const user = ref<UserProfileI>();
const isError = ref<boolean>(false);
const isSelf = ref<boolean>();
const isFriend = ref<boolean>();

onMounted(async () => {
  await findUser();
  isSelf.value = id === String(storeUser.state.user.id);
  if (!isSelf.value) {
    await axios(
      "http://localhost:3000/user/is-friend?id1=" +
        storeUser.state.user.id +
        "&id2=" +
        id,
      { withCredentials: true }
    )
      .then((response) => {
        isFriend.value = response.data;
      })
      .catch(() => {
        isError.value = true;
      });
  }
});

async function findUser() {
  await axios
    .get("http://localhost:3000/user/find-by-id?id=" + id, {
      withCredentials: true,
    })
    .then((response) => {
      if (response.data) {
        user.value = response.data;
      } else {
        isError.value = true;
      }
    })
    .catch(() => {
      isError.value = true;
    });
}

function changeFriendStatus() {
  isFriend.value = !isFriend.value;
}

const router = useRouter();

function toSetting() {
  router.push({ name: "UserSetting" });
}

function toPrivateMessage() {
  console.log("go to private message"); //TODO: to change route to private chat
}
</script>
<style scoped>
.card {
  background-color: beige;
  border-width: 5;
  border-color: aqua;
}
</style>
