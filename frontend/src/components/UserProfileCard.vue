<template>
  <div v-if="isError">
    <Message severity="error" :closable="false">
      Oops, this user does not exist.
    </Message>
  </div>
  <div v-else align="center">
    <Card style="width: 25rem; margin-bottom: 2em">
      <template #header>
        <img :src="user?.avatar" />
      </template>
      <template #title>
        <h3>{{ user?.username }}</h3>
      </template>
      <template #content>
        <p>content [TBD]</p>
      </template>
      <template #footer>
        <p>footer [TBD]</p>
      </template>
    </Card>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from "vue-router";
import { onMounted, ref } from "vue";
import axios from "axios";
import Message from "primevue/message";
import Card from "primevue/card";
import UserProfileI from "@/types/UserProfile.interface";

const route = useRoute();
const id = route.params.id;
const user = ref<UserProfileI>();
const isError = ref<boolean>(false);

onMounted(async () => {
  await findUser();
});

async function findUser() {
  await axios
    .get("http://localhost:3000/user/find-by-id?id=" + id, {
      withCredentials: true,
    })
    .then((response) => {
      if (response.data) {
        user.value = response.data;
        if (user.value?.username === "admin") {
          isError.value = true;
        }
      } else {
        isError.value = true;
      }
    })
    .catch(() => {
      isError.value = true;
    });
}
</script>
<style scoped></style>
