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
          required
          type="text"
          class="w-full mb-4"
          v-model="name"
        />

        <!-- <div class="flex align-items-center justify-content-center mb-4"> -->
        <div class="grid">
          <div
            v-for="category of categories"
            :key="category.key"
            class="field-radiobutton col-12"
          >
            <RadioButton
              :id="category.key"
              name="category"
              :value="category.type"
              v-model="selectedCategory"
            />
            <label :for="category.key">{{ category.name }}</label>
          </div>
        </div>

        <PrimeVueButton
          @click="saveNewRoom"
          label="Create"
          icon="pi pi-check"
          class="p-button-primary"
        ></PrimeVueButton>
      </div>
    </div>
    <router-view></router-view>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted } from "vue";
import { useRouter } from "vue-router";
import PrimeVueButton from "primevue/button";
import RadioButton from "primevue/radiobutton";
import InputText from "primevue/inputtext";

import Room from "../types/Room";
import RoomVisibilityType from "../types/RoomVisibility";
import { Socket } from "socket.io-client";

// Because we don't have access to 'this' inside of setup, we cannot directly access this.$router or this.$route anymore.
// Instead we use the useRouter function:
const router = useRouter();

//reactive state:
// for visibility categories:
const categories = ref([
  { name: "Public", key: "1", type: RoomVisibilityType.PUBLIC },
  { name: "Private", key: "2", type: RoomVisibilityType.PRIVATE },
  {
    name: "Protected with password",
    key: "3",
    type: RoomVisibilityType.PROTECTED,
  },
]);
const selectedCategory = ref(categories.value[0].type); // public visibility will always be the default one

// state of the new room name:
const name = ref<string>();
// push user to a newly created room
function pushToNewRoom() {
  router.push({
    name: "chat", // FIXME : temporarily pushing back to chat
  });
}
const socket: Socket = inject("socketioInstance");

onMounted(() => {
  socket.on("createRoom", (response: { status: string; data: string }) => {
    console.log("Response is :", response.status);
    if (response.status === "OK") {
      pushToNewRoom();
    } else {
      console.log(
        `The Chat Room '${response.data}' exists. Please choose another name` //FIXME: create message popup
      );
    }
  });
});

function saveNewRoom() {
  const newRoom: Room = {
    name: name.value,
    isDirectMessage: false,
    RoomVisibilityType: selectedCategory.value,
  };
  console.log("newRoom: ", newRoom);
  socket.emit("createRoom", newRoom);
}
</script>
<style scoped></style>
