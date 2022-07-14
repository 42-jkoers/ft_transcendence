<template>
  <div v-if="isUserExist" align="center">
    <div>
      <Card style="width: 30%; margin: 5%; border-radius: 5%; border: Groove">
        <template #header>
          <img
            :src="user?.avatar"
            style="width: 95%; margin-top: 5%; border-radius: 3%"
          />
        </template>
        <template #title>
          <h3>
            {{ user?.username }}
          </h3>
        </template>
        <template #content>
          <div v-if="isSafe">
            <UserStatus :userId="user?.id" :gameStatus="user?.gameStatus" />
            <br />
            <h4>Ladder {{ user?.ladder }}</h4>
            <Button
              label="View Match History"
              icon="pi pi-book"
              class="p-button-rounded p-button-outlined"
              @click="showMatchHistory"
            />
          </div>
        </template>
        <template #footer>
          <div>
            <div v-if="isSelf">
              <Button
                label="Edit Profile"
                class="p-button-rounded p-button-outlined"
                icon="pi pi-user-edit"
                @click="toSetting"
              />
            </div>
            <div v-else>
              <div>
                <ChatBoxSendDMButton :clickedUserId="user?.id" />
              </div>
              <br />
            </div>
            <div>
              <div v-if="isFriend">
                <EditFriendButton
                  :friendId="user?.id"
                  buttonLabel="Unfriend"
                  buttonIcon="pi pi-user-minus"
                  :action="EditFriendActionType.REMOVE_FRIEND"
                  @isActionSuccess="catchEvent($event)"
                />
              </div>
              <div v-if="!isSafe">
                <EditFriendButton
                  :friendId="user?.id"
                  buttonLabel="Add friend"
                  buttonIcon="pi pi-user-plus"
                  :action="EditFriendActionType.SEND_REQUEST"
                  @isActionSuccess="catchEvent($event)"
                />
              </div>
            </div>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRoute } from "vue-router";
import { onMounted, ref, computed, watch, inject, onUnmounted } from "vue";
import Card from "primevue/card";
import Button from "primevue/button";
import UserProfileI from "@/types/UserProfile.interface";
import storeUser from "@/store";
import { useRouter } from "vue-router";
import EditFriendButton from "./EditFriendButton.vue";
import { EditFriendActionType } from "@/types/editFriendAction";
import { useToast } from "primevue/usetoast";
import UserStatus from "./UserStatus.vue";
import { Socket } from "socket.io-client";
import ChatBoxSendDMButton from "./ChatBoxSendDMButton.vue";

const socket: Socket = inject("socketioInstance") as Socket;

const toast = useToast();
const route = useRoute();
const id = computed(() => route.params.id);
const user = ref<UserProfileI>();
const isSelf = ref<boolean>();
const isFriend = ref<boolean>();
const isSafe = ref<boolean>();
const isUserExist = ref<boolean>(false);

watch(id, async () => {
  await updateProfile();
});

onMounted(async () => {
  await updateProfile();
  socket.on("getUserProfile", (userData, isFriendResult) => {
    user.value = userData;
    isUserExist.value = true;
    isSelf.value = id.value === String(storeUser.state.user.id);
    isFriend.value = isFriendResult;
    evaluateIsSafe();
  });

  socket.on("errorGetUserProfile", (errorMessage) => {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: errorMessage,
      life: 3000,
    });
  });
});

onUnmounted(() => {
  socket.off("getUserProfile");
  socket.off("errorGetUserProfile");
});

async function updateProfile() {
  if (id.value) {
    socket.emit("getUserProfile", { data: parseInt(id.value[0]) });
  }
}

function evaluateIsSafe() {
  isSafe.value = isSelf.value || isFriend.value;
}

function showMatchHistory() {
  const UserID = id.value;
  router.push({
    name: "MatchHistory",
    params: { id: UserID },
  });
}

function changeFriendStatus() {
  isFriend.value = false;
  evaluateIsSafe();
}

const router = useRouter();

function toSetting() {
  router.push({ name: "UserSetting" });
}

function catchEvent(event) {
  if (event) {
    changeFriendStatus();
  }
}
</script>
<style scoped>
.card {
  background-color: beige;
  border-width: 5;
  border-color: aqua;
}
</style>
