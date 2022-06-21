<template>
  <div v-if="isUserExist" align="center">
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
                :action="EditFriendActionType.REMOVE_FRIEND"
                @isActionSuccess="catchEvent($event)"
              />
            </div>
            <div v-else>
              <EditFriendButton
                :friendId="user?.id"
                buttonLabel="Add friend"
                buttonIcon="pi pi-user-plus"
                :action="EditFriendActionType.SEND_REQUEST"
                @isActionSuccess="catchEvent($event)"
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
import Card from "primevue/card";
import Button from "primevue/button";
import UserProfileI from "@/types/UserProfile.interface";
import storeUser from "@/store";
import { useRouter } from "vue-router";
import EditFriendButton from "./EditFriendButton.vue";
import { EditFriendActionType } from "@/types/editFriendAction";
import { useToast } from "primevue/usetoast";
import { ErrorType, errorMessage } from "@/types/errorManagement";

const toast = useToast();
const route = useRoute();
const id = route.params.id;
const user = ref<UserProfileI>();
const isSelf = ref<boolean>();
const isFriend = ref<boolean>();
const isUserExist = ref<boolean>(false);

onMounted(async () => {
  try {
    await findUser();
    if (isUserExist.value) {
      isSelf.value = id === String(storeUser.state.user.id);
      if (!isSelf.value) {
        await axios(
          "http://localhost:3000/friend/is-friend?id1=" +
            storeUser.state.user.id +
            "&id2=" +
            id,
          { withCredentials: true }
        ).then((response) => {
          isFriend.value = response.data;
        });
      }
    }
  } catch (error) {
    toast.add({
      severity: "error",
      summary: "Error",
      detail: errorMessage(ErrorType.GENERAL),
      life: 3000,
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
        isUserExist.value = true;
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

function changeFriendStatus() {
  isFriend.value = false;
}

const router = useRouter();

function toSetting() {
  router.push({ name: "UserSetting" });
}

function toPrivateMessage() {
  console.log("go to private message"); //TODO: to change route to private chat
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
