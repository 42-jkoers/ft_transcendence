<template>
  <div v-if="isError">
    <Message severity="error" :closable="false">
      Oops, this user does not exist.
    </Message>
  </div>
  <div v-else align="center">
    <div>
      <Card
        style="width: 20rem; margin: 1em; border-radius: 5%; border: Groove"
      >
        <template #header>
          <img :src="user?.avatar" style="margin-top: 2rem" />
        </template>
        <template #title>
          <h3>{{ user?.username }}</h3>
        </template>
        <template #content>
          <p>[other info to be added]</p>
        </template>
        <template #footer>
          <div v-if="isShowMessageButton">
            <Button
              label="Message"
              icon="pi pi-envelope"
              @click="toPrivateMessage"
            />
          </div>
          <div v-else>
            <Button
              label="Edit Profile"
              icon="pi pi-user-edit"
              @click="toSetting"
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

const route = useRoute();
const id = route.params.id;
const user = ref<UserProfileI>();
const isError = ref<boolean>(false);
const isShowMessageButton = ref<boolean>(false);

onMounted(async () => {
  await findUser();
  if (id !== String(storeUser.state.user.id)) {
    isShowMessageButton.value = true;
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
        // if (user.value?.username === "admin") {
        //   isError.value = true;
        // }
      } else {
        isError.value = true;
      }
    })
    .catch(() => {
      isError.value = true;
    });
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
