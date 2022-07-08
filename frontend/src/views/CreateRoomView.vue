<template>
  <div
    class="card-container flex justify-content-center"
    style="height: 100%; min-height: 100vh"
  >
    <div
      class="surface-card grid p-4 mt-4 w-full lg:w-6"
      style="height: 60%; min-height: 60vh"
    >
      <div class="col-12 text-900 text-3xl font-medium mb-3">
        Create a Chat Room
      </div>
      <div class="col-12">
        <span class="p-float-label">
          <InputText
            id="room-name"
            type="text"
            class="room-name-input w-full"
            v-model="newRoomName"
            required="true"
            maxlength="64"
          />
          <label for="room-name"
            >The name must start with a Latin letter. It can contain digits and
            '_'</label
          >
          <small v-if="!isValidRoomName" id="room-name" class="p-error">{{
            invalidRoomNameResponseMessage
          }}</small>
        </span>

        <div class="card">
          <div
            v-for="visibility of visibilityTypes"
            :key="visibility.key"
            class="field-radiobutton"
          >
            <RadioButton
              :id="visibility.key"
              name="category"
              :value="visibility.type"
              @change="togglePasswordBlock"
              v-model="selectedCategory"
            />
            <label :for="visibility.key">{{ visibility.name }}</label>
          </div>
          <div class="field grid">
            <BlockUI :blocked="blockedPasswordInput">
              <span class="p-float-label">
                <Password
                  id="password"
                  :v-model="passwordValue"
                  toggleMask
                  maxlength="64"
                />
                <label for="password">Protect with password</label>
              </span>
            </BlockUI>
          </div>
          <div class="field grid">
            <small id="password-help"
              >Leave it blank if you want to let other users access your chat
              room</small
            >
          </div>
        </div>
        <div class="flex flex-wrap justify-content-center mt-6">
          <PrimeVueButton
            @click="closeCreateRoomView"
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text m-3"
          ></PrimeVueButton>
          <PrimeVueButton
            @click="saveNewRoom"
            label="Create"
            icon="pi pi-check"
            class="m-3"
            v-bind:disabled="!newRoomName.length"
          ></PrimeVueButton>
        </div>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue";
import { useRouter } from "vue-router";
import Room from "../types/Room";
import RoomVisibilityType from "../types/RoomVisibility";
import { Socket } from "socket.io-client";
import PrimeVueButton from "primevue/button";
import RadioButton from "primevue/radiobutton";
import InputText from "primevue/inputtext";
import Password from "primevue/password";
import BlockUI from "primevue/blockui";

// Because we don't have access to 'this' inside of setup, we cannot directly access this.$router or this.$route anymore.
// Instead we use the useRouter function:
const router = useRouter();

//reactive state:
// for available visibility categories:
const visibilityTypes = ref([
  { name: "Public", key: "1", type: RoomVisibilityType.PUBLIC },
  { name: "Private", key: "2", type: RoomVisibilityType.PRIVATE },
]);
const selectedCategory = ref(visibilityTypes.value[0].type); // public visibility will always be the default one

// for password
const blockedPasswordInput = ref<boolean>(false);
const passwordValue = ref(null);
function togglePasswordBlock() {
  if (selectedCategory.value === RoomVisibilityType.PRIVATE) {
    blockedPasswordInput.value = true;
  } else {
    blockedPasswordInput.value = false;
  }
}

// state of the new room name:
const newRoomName = ref<string>("");
// push user to a newly created room
function pushToNewRoom(newRoomName: string) {
  router.push({
    name: "ChatBox",
    params: { roomName: newRoomName },
  });
}

// enjecting the socketIO instance  for catching incoming events
const socket: Socket = inject("socketioInstance") as Socket;

// reactive state for showing error message for invalid room name
const isValidRoomName = ref<boolean>(true);
const invalidRoomNameResponseMessage = ref<string>("");

socket.on("BadRequestException", (response) => {
  isValidRoomName.value = false;
  invalidRoomNameResponseMessage.value = response.message[0];
});

onMounted(() => {
  socket.on("createRoom", (response: { status: string; data: string }) => {
    if (response.status === "OK") {
      isValidRoomName.value = true;
      pushToNewRoom(response.data);
    } else {
      isValidRoomName.value = false;
      invalidRoomNameResponseMessage.value = `'${response.data}' is already in use. Please choose another name`;
    }
  });
});

function saveNewRoom() {
  const newRoom: Room = {
    name: newRoomName.value,
    isDirectMessage: false,
    visibility: selectedCategory.value,
    password: passwordValue.value,
  };
  // setting an empty password value to null:
  if (
    newRoom.password === "" ||
    newRoom.visibility === RoomVisibilityType.PRIVATE
  ) {
    newRoom.password = null;
  }
  socket.emit("createRoom", newRoom);
  isValidRoomName.value = true;
}

function closeCreateRoomView() {
  router.push({
    name: "Chat",
  });
}
</script>
<style scoped>
.card {
  margin-top: 2rem;
}
.field {
  margin-bottom: 0;
}
.p-button-primary {
  margin-top: 2rem;
}
</style>
