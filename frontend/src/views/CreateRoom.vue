<template>
  <div
    class="card-container flex justify-content-center"
    style="height: 100%; min-height: 100vh"
  >
    <div
      class="surface-card grid p-4 shadow-2 border-round w-full lg:w-6"
      style="height: 60%; min-height: 60vh"
    >
      <div class="col-12 text-900 text-3xl font-medium mb-3">
        Create a Chat Room
      </div>
      <div class="col-12">
        <label for="room-name" class="block text-900 font-medium mb-2"
          >Name</label
        >
        <InputText
          id="room-name"
          type="text"
          class="room-name-input w-full mb-4"
          v-model="newRoomName"
          required="true"
        />

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
                <Password id="password" v-model="passwordValue" toggleMask />
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

        <PrimeVueButton
          @click="saveNewRoom"
          label="Create"
          icon="pi pi-check"
          class="p-button-primary"
          v-bind:disabled="!newRoomName.length"
        ></PrimeVueButton>
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
// for visibility categories:
const visibilityTypes = ref([
  { name: "Public", key: "1", type: RoomVisibilityType.PUBLIC },
  { name: "Private", key: "2", type: RoomVisibilityType.PRIVATE },
]);

const selectedCategory = ref(visibilityTypes.value[0].type); // public visibility will always be the default one
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
const newRoomName = ref<string>("My New Room");
// push user to a newly created room
function pushToNewRoom(newRoomName: string) {
  router.push({
    name: "ChatBox",
    params: { roomName: newRoomName },
  });
}
const socket: Socket = inject("socketioInstance");

onMounted(() => {
  socket.on("createRoom", (response: { status: string; data: string }) => {
    console.log("Response is :", response.status);
    if (response.status === "OK") {
      pushToNewRoom(response.data);
    } else {
      console.log(
        `The Chat Room '${response.data}' exists. Please choose another name` //FIXME: create message popup
      );
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
  console.log("newRoom created on frontend: ", newRoom);
  socket.emit("createRoom", newRoom);
}
</script>
<style scoped>
.field {
  margin-bottom: 0;
}
.p-button-primary {
  margin-top: 2rem;
}
</style>
