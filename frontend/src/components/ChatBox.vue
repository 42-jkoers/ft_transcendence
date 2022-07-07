<template>
  <div v-if="allowedToViewContent">
    <Panel v-if="currentRoom" :header="currentRoom.displayName">
      <template
        v-if="currentRoom && currentRoom.isDirectMessage === false"
        #icons
      >
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
      <UnblockUserButton
        v-if="
          currentRoom && currentRoom.isDirectMessage && isBlockingSecondUser
        "
        :userId="currentRoom.secondParticipant[0]"
      />
      <div
        v-else-if="currentRoom && isBlocked"
        class="flex justify-content-center align-items-center"
      >
        <h3>You cannot send messages to {{ currentRoom.displayName }}</h3>
      </div>
      <div
        v-else-if="currentRoom && currentRoom.userRole !== undefined"
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
  <div v-else>
    <Panel> </Panel>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted, computed } from "vue";
import { Socket } from "socket.io-client";
import MessageI from "../types/Message.interface";
import { useRoute } from "vue-router";
import moment from "moment";
import { useStore } from "vuex";
import UserProfileI from "../types/UserProfile.interface";
import storeUser from "@/store";
import ChatBoxUserProfileDialogue from "./ChatBoxUserProfileDialogue.vue";
import { UserRole } from "@/types/UserRole.Enum";
import ChatBoxAddUsersDialogue from "./ChatBoxAddUsersDialogue.vue";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import PrimeVueButton from "primevue/button";
import Panel from "primevue/panel";
import Chip from "primevue/chip";
import ContextMenu from "primevue/contextmenu";
import { useToast } from "primevue/usetoast";
import { useConfirm } from "primevue/useconfirm";
import UnblockUserButton from "./UnblockUserButton.vue";

const socket: Socket = inject("socketioInstance") as Socket;
const messages = ref<Array<MessageI>>([]);
const input = ref<string>("");
const route = useRoute();
const toast = useToast();

const clickedUser = ref<UserProfileI>(storeUser.state.user);
const computedID = computed(() => {
  return clickedUser.value.id;
}); //items ref params need a calculated property
const isUserBanned = ref<boolean>();
const computedIsUserBanned = computed(() => {
  return isUserBanned.value;
});

const isBlockingSecondUser = ref<boolean>(false);
const isBlocked = ref<boolean>(false);

const displayUserProfileDialog = ref(false);
const displayAddUsersDialogue = ref(false);

const store = useStore();
const currentRoom = computed(() =>
  store.state.roomsInfo.find((room: any) => room.name === route.params.roomName)
);

const allowedToViewContent = ref<boolean>(false);
onMounted(() => {
  socket.emit("getMessagesForRoom", route.params.roomName); //emit to load once it's mounted

  socket.on("noPermissionToViewContent", () => {
    allowedToViewContent.value = false;
  });

  socket.on("getMessagesForRoom", (response) => {
    if (currentRoom.value) {
      switch (currentRoom.value.userRole) {
        case UserRole.BLOCKING:
          isBlockingSecondUser.value = true;
          break;
        case UserRole.BLOCKED:
          isBlocked.value = true;
          break;
        case UserRole.BANNED:
          allowedToViewContent.value = false;
          break;
        default:
          allowedToViewContent.value = true;
          messages.value = response;
      }
    }
  }); //recevies the existing messages from backend when room is first loaded

  socket.on("messageAdded", (message: MessageI) => {
    if (route.params.roomName === message.room.name)
      messages.value.unshift(message);
  }); //place the new message on top of the messages arrayy

  socket.on("userBanFromRoomResult", (response) => {
    isUserBanned.value = response;
  });
});

onUnmounted(() => {
  socket.off("messageAdded"); //to prevent multiple event binding in every rerender
});

socket.on("NoPermissionToAddMessage", () => {
  console.log("No permission event caught");
}); //TODO: do we need to handle this?

//binding a click event listener to a method named 'sendMessage'
function sendMessage() {
  if (input.value) {
    socket.emit("addMessage", {
      text: input.value,
      room: { name: route.params.roomName },
      secondUserId: currentRoom.value.secondParticipant
        ? currentRoom.value.secondParticipant[0]
        : undefined,
    });
  }
  input.value = "";
}

const ShowSuccessfulRoleChangeMessage = (
  newUserRole: UserRole,
  username: string,
  roomName: string
) => {
  const userRoleMessage = {
    [UserRole.OWNER]: `is the owner of ${roomName} now`,
    [UserRole.ADMIN]: `is the administrator of ${roomName} now`,
    [UserRole.VISITOR]: `is added to ${roomName}`,
    [UserRole.BANNED]: `is banned from ${roomName}`,
    [UserRole.MUTED]: `is muted in ${roomName}`,
    [UserRole.BLOCKED]: "is blocked",
    [UserRole.BLOCKING]: "is blocking",
  };

  toast.add({
    severity: "info",
    summary: "",
    detail: `${username} ${userRoleMessage[newUserRole]}`,
    life: 2000,
  });
};

const ShowNewRoleMessage = (newUserRole: UserRole, roomName: string) => {
  const userRoleMessage = {
    [UserRole.OWNER]: `have been set as the owner of ${roomName}`,
    [UserRole.ADMIN]: `have been set as the administrator of ${roomName}`,
    [UserRole.VISITOR]: `are added to the ${roomName}`,
    [UserRole.BANNED]: `have been banned from ${roomName}`,
    [UserRole.MUTED]: `have been muted in ${roomName} for 1 hour`,
    [UserRole.BLOCKED]: "have been blocked",
    [UserRole.BLOCKING]: "are blocking",
  };
  toast.add({
    severity: "info",
    summary: "",
    detail: `You ${userRoleMessage[newUserRole]}`,
    life: 2000,
  });
};

const ShowRoleChangeFailMessage = (newUserRole: UserRole, roomName: string) => {
  const userRoleMessage = {
    [UserRole.OWNER]: `set as the owner of ${roomName}`,
    [UserRole.ADMIN]: "set as the room administrator",
    [UserRole.VISITOR]: "set as the room visitor",
    [UserRole.BANNED]: "banned from chat",
    [UserRole.MUTED]: "muted",
    [UserRole.BLOCKED]: "blocked from chat",
    [UserRole.BLOCKING]: "blocking",
  };

  toast.add({
    severity: "error",
    summary: "Error",
    detail: `User cannot be ${userRoleMessage[newUserRole]}`,
    life: 2000,
  });
};

socket.on(
  "userRoleChanged",
  (newUserRole: UserRole, username: string, roomName: string) => {
    ShowSuccessfulRoleChangeMessage(newUserRole, username, roomName);
  }
);

socket.on("newRoleAcquired", (newRole: UserRole, roomName: string) => {
  ShowNewRoleMessage(newRole, roomName);
});

socket.on("setUserRoleFail", (newUserRole: UserRole, roomName: string) => {
  ShowRoleChangeFailMessage(newUserRole, roomName);
});

socket.on(
  "blockUserResult",
  (response: { id: number; username: string } | undefined) => {
    if (!response) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: `Error blocking the user`,
        life: 2000,
      });
    } else {
      isBlockingSecondUser.value = true;
    }
  }
);

socket.on(
  "unblockUserResult",
  (response: { id: number; username: string } | undefined) => {
    if (!response) {
      toast.add({
        severity: "error",
        summary: "Error",
        detail: `Error unblocking user`,
        life: 2000,
      });
    } else {
      isBlockingSecondUser.value = false;
    }
  }
);

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
const confirm = useConfirm();

const confirmBlockUser = () => {
  confirm.require({
    message: `Are you sure you want to block ${clickedUser.value.username}?`,
    header: `Block ${clickedUser.value.username}?`,
    icon: "pi pi-info-circle",
    acceptClass: "p-button-danger",
    accept: () => {
      socket.emit("blockUser", { id: computedID.value });
    },
  });
};

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
    visible: () => store.state.user.id !== computedID.value,
    command: () => {
      socket.emit("sendGameInvite", computedID.value);
      toast.add({
        severity: "info",
        detail: "Game invitation sent.",
        life: 2000,
      });
    },
  },
  {
    separator: true,
  },
  {
    label: "Set admin",
    visible: () =>
      isOwner(currentRoom.value.userRole) &&
      store.state.user.id !== computedID.value,
    command: () =>
      socket.emit("setNewUserRole", {
        newRole: UserRole.ADMIN,
        userToGetNewRoleId: computedID.value,
        roomName: currentRoom.value.name,
      }),
  },
  {
    label: "Ban from chat",
    visible: () =>
      isOwnerOrAdmin(currentRoom.value.userRole) &&
      isNotYourself(computedID.value) &&
      !isBanned(computedID.value),
    command: () => banUserFromRoom(),
  },
  {
    label: "Unban",
    visible: () =>
      isOwnerOrAdmin(currentRoom.value.userRole) &&
      isNotYourself(computedID.value) &&
      isBanned(computedID.value),
    command: () => unBanUserFromRoom(),
  },
  {
    label: "Mute for 1 hour",
    visible: () =>
      isOwnerOrAdmin(currentRoom.value.userRole) &&
      isNotYourself(computedID.value),
    command: () => muteUserInRoom(),
  },
  {
    label: "Block",
    visible: () => isNotYourself(computedID.value),
    command: () => confirmBlockUser(),
  },
]);

const muteUserInRoom = () => {
  socket.emit("muteUserInRoom", {
    id: computedID.value,
    roomName: route.params.roomName,
    durationMinute: 60,
  });
};

const banUserFromRoom = () => {
  socket.emit("banUserFromRoom", {
    userId: computedID.value,
    roomName: route.params.roomName,
  });
};

const unBanUserFromRoom = () => {
  socket.emit("unBanUserFromRoom", {
    userId: computedID.value,
    roomName: route.params.roomName,
  });
};

const isOwner = (userRole: UserRole | undefined) =>
  userRole === 0 ? true : false;
const isOwnerOrAdmin = (userRole: UserRole | undefined) =>
  userRole < 2 ? true : false;
const isNotYourself = (userID: number) =>
  userID === store.state.user.id ? false : true;
const isBanned = (userID: number) => {
  socket.emit("isUserBanned", {
    userId: userID,
    roomName: route.params.roomName,
  });
  return computedIsUserBanned.value;
};
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
