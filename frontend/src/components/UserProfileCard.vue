<template>
  <div v-if="isUserExist" align="center">
    <div>
      <Card style="width: 30%; margin: 5%; border-radius: 5%; border: Groove">
        <template #header>
          <img
            :src="user?.avatar"
            width="300"
            height="300"
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
            <h4>(to be add) game record</h4>
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
import { onMounted, ref, computed, watch, inject } from "vue";
import axios from "axios";
import Card from "primevue/card";
import Button from "primevue/button";
import UserProfileI from "@/types/UserProfile.interface";
import storeUser from "@/store";
import { useRouter } from "vue-router";
import EditFriendButton from "./EditFriendButton.vue";
import { EditFriendActionType } from "@/types/editFriendAction";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/errorManagement";
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
  if (id.value) {
    await updateProfile();
  }
});

onMounted(async () => {
  setTimeout(async () => {
    await updateProfile();
  }, 100); // wait till socket connection finished (to get correct socketCount)
});

async function updateProfile() {
  await findUser();
  await checkRelationship();
  evaluateIsSafe();
}

async function findUser() {
  socket.emit("getUserProfile", { data: id.value });
  socket.on("getUserProfile", (userData) => {
    if (userData) {
      user.value = userData;
      isUserExist.value = true;
      isSelf.value = id.value === String(storeUser.state.user.id);
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

async function checkRelationship() {
  if (!isSelf.value) {
    await axios(
      "http://localhost:3000/friend/is-friend?id1=" +
        storeUser.state.user.id +
        "&id2=" +
        id.value,
      { withCredentials: true }
    ).then((response) => {
      isFriend.value = response.data;
    });
  }
}

function evaluateIsSafe() {
  isSafe.value = isSelf.value || isFriend.value;
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
