<template>
  <div>
    <Panel :header="$route.params.roomName">
      <template #icons>
        <PrimeVueButton
          label="Add User"
          icon="pi pi-users"
          @click="onAddUserClick"
        />
      </template>
    </Panel>
    <ChatBoxAddUsersDialogue
      :isDialogVisible="displayAddUsersDialogue"
      @update:isDialogVisible="displayAddUsersDialogue = $event"
    />
    <ChatBoxUserProfileDialogue
      :isDialogVisible="displayUserProfileDialog"
      :clickedUserObject="clickedUser"
      @update:isDialogVisible="displayUserProfileDialog = $event"
    />
    <ContextMenu ref="menu" :model="items" />
    <div
      id="all-messages"
      class="flex flex-column-reverse gap-1 md:gap-2 xl:gap-4"
    >
      <div
        class="flex align-items-start py-2"
        v-for="m in messages"
        :key="m.id"
      >
        <Card>
          <template #title>
            <div class="msg-top flex flex-row flex-wrap gap-2">
              <Chip
                class="user"
                :label="m.user.username"
                :image="m.user.avatar"
                @contextmenu="onChipRightClick(m.user)"
                @click="onChipLeftClick(m.user)"
              />
              <Chip class="time" :label="moment(m.created_at).format('LT')" />
            </div>
          </template>
          <template #content>
            <p class="card-content">
              {{ m.text }}
            </p>
          </template>
        </Card>
      </div>
    </div>
    <div id="input-field" class="card col-12">
      <div
        v-if="currentRoom && currentRoom.userRole !== undefined"
        class="flex justify-content-center align-items-strech flex-wrap card-container"
      >
        <InputText
          type="text"
          v-model.trim="input"
          maxlength="200"
          placeholder="Type your message..."
          @keyup.enter="sendMessage"
          class="w-11"
        >
        </InputText>
        <PrimeVueButton
          @click="sendMessage"
          icon="pi pi-send"
          class="p-button-primary w-1"
        />
      </div>
      <PrimeVueButton
        v-else
        @click="addUserToRoom"
        label="Join chat"
        icon="pi pi-plus"
        class="p-button-outlined p-button-info mt-6"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, computed } from "vue";
import { Socket } from "socket.io-client";
import MessageI from "../types/Message.interface";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import PrimeVueButton from "primevue/button";
import Panel from "primevue/panel";
import { useRoute } from "vue-router";
import moment from "moment";
import Chip from "primevue/chip";
import ContextMenu from "primevue/contextmenu";
import { useStore } from "vuex";
import UserProfileI from "../types/UserProfile.interface";
import storeUser from "@/store";
import ChatBoxUserProfileDialogue from "./ChatBoxUserProfileDialogue.vue";
import { UserRole } from "@/types/UserRole.Enum";
import ChatBoxAddUsersDialogue from "./ChatBoxAddUsersDialogue.vue";

const socket: Socket = inject("socketioInstance");
const messages = ref<Array<MessageI>>([]);
const input = ref<string>("");
const route = useRoute();

const clickedUser = ref<UserProfileI>(storeUser.state.user);
const computedID = computed(() => {
  return clickedUser.value.id;
}); //items ref params need a calculated property

const displayUserProfileDialog = ref(false);
const displayAddUsersDialogue = ref(false);

const store = useStore();
const currentRoom = computed(() =>
  store.state.roomsInfo.find((room) => room.name === route.params.roomName)
);

onMounted(() => {
  socket.emit("getMessagesForRoom", route.params.roomName); //emit to load once it's mounted

  socket.on("getMessagesForRoom", (response) => {
    messages.value = response;
  }); //recevies the existing messages from backend when room is first loaded

  socket.on("messageAdded", (message: MessageI) => {
    if (route.params.roomName === message.room.name)
      messages.value.unshift(message);
  }); //place the new message on top of the messages arrayy
});

onUnmounted(() => {
  socket.off("messageAdded"); //to prevent multiple event binding in every rerender
});

//binding a click event listener to a method named 'sendMessage'
function sendMessage() {
  if (input.value)
    socket.emit("addMessage", {
      text: input.value,
      room: { name: route.params.roomName },
    });
  input.value = "";
}

const addUserToRoom = () => {
  socket.emit("addUserToRoom", route.params.roomName);
};

function onAddUserClick() {
  displayAddUsersDialogue.value = true;
}

function onChipLeftClick(user: UserProfileI) {
  clickedUser.value = user;
  displayUserProfileDialog.value = true;
}

function onChipRightClick(user: UserProfileI) {
  clickedUser.value = user;
  menu.value.show(event);
} //shows ContextMenu when UserChip is right clicked and reassigns the ID value

const menu = ref();
const items = ref([
  {
    label: "View profile",
    icon: "pi pi-fw pi-user",
    to: {
      name: "UserProfileCard",
      params: { id: computedID },
    },
  },
  {
    label: "Play pong",
    icon: "pi pi-fw pi-caret-right",
  }, //TODO add a View to play game when we have it ready
  {
    separator: true,
  },
  {
    label: "Set admin",
    visible: () => isOwner(0), //FIXME pass selectedRoom's info
    command: () => socket.emit("setUserAsAdmin"), //TODO pass user.id & room.name & add backend logic
  },
  {
    label: "Ban user",
    visible: () => isAdmin(1), //FIXME pass selectedRoom's info
    command: () => socket.emit("banUserFromRoom"), //TODO pass user.id & room.name & add backend logic
  },
  {
    label: "Mute user",
    visible: () => isAdmin(1), //FIXME pass selectedRoom's info
    command: () => socket.emit("muteUserInRoom"), //TODO pass user.id & room.name & add backend logic
  },
]);

const isOwner = (userRole: UserRole | undefined) =>
  userRole === 0 ? true : false;
const isAdmin = (userRole: UserRole | undefined) =>
  userRole === 1 ? true : false;
</script>

<style scoped>
#all-messages {
  height: 50vh; /*if there is no height it does not scroll */
  overflow-y: scroll; /* FIXME school computer shows white bars */
  overflow-wrap: break-word;
}

.p-card {
  background: #9da3d2;
  max-width: 35vw;
  font-size: small;
  text-align: left;
}

.p-chip.user {
  font-size: 50%;
  height: 2vh;
}

.p-chip.user:hover {
  text-decoration: underline;
  cursor: pointer;
}

.p-chip.time {
  font-size: 50%;
  height: 2vh;
  background-color: #9da3d2;
}

.msg-top {
  justify-content: space-between;
  margin-bottom: 0;
  max-width: 100%;
}

.card-content {
  margin: 0;
  color: #1e1e1e;
}
</style>
