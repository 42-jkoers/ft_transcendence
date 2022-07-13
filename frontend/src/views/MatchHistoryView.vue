<template>
  <div class="grid">
    <div class="col-12 md:col-6 lg:col-3" style="width: 400px">
      <h1>User Info</h1>
      <div class="grid">
        <div class="col-fixed" style="width: 150px">
          <br />
          <br />
          <br />
          <Avatar :image="user?.avatar" shape="circle" size="xlarge" />
        </div>
        <div class="col">
          <br />
          <br />
          <h2 align="left">{{ user?.username }}</h2>
          <h3 align="left">ladder: {{ user?.ladder }}</h3>
        </div>
      </div>
    </div>
    <div class="col">
      <MatchHistoryTable />
    </div>
  </div>
</template>

<script setup lang="ts">
import MatchHistoryTable from "../components/MatchHistoryTable.vue";
import { useRoute } from "vue-router";
import { watch, inject, ref, computed, onMounted } from "vue";
import { Socket } from "socket.io-client";
import UserProfileI from "@/types/UserProfile.interface";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/errorManagement";
import Avatar from "primevue/avatar";

const socket: Socket = inject("socketioInstance");
const user = ref<UserProfileI>();
const router = useRoute();
const id = computed(() => router.params.id); //this is to get the id passed in as parameter from the router
const toast = useToast(); //TODO check if we need it later

onMounted(async () => {
  await findUser();
});

//this is to watch anything on the $route object
watch(id, async () => {
  if (id.value) {
    await findUser();
  }
});

async function findUser() {
  socket.emit("getUserProfile", { data: parseInt(id.value[0]) });
  socket.on("getUserProfile", (response) => {
    if (response) {
      user.value = response;
    } else {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: errorMessage(ErrorType.USER_NOT_EXIST),
        life: 3000,
      });
    }
  });
}
</script>
