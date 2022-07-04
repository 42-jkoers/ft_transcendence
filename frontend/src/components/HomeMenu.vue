<template>
  <MegaMenu :model="MenuItems" />
</template>
<script setup lang="ts">
import { ref } from "vue";
import MegaMenu from "primevue/megamenu";
import storeUser from "@/store";
const MenuItems = ref([
  {
    label: "Home",
    icon: "pi pi-fw pi-home",
    to: { name: "UserHome" },
  },
  {
    label: "Chat",
    icon: "pi pi-fw pi-comments",
    to: { name: "Chat" },
  },
  {
    label: "Game",
    icon: "pi pi-fw pi-discord",
    to: { name: "Game" },
  },
  {
    label: "Profile",
    icon: "pi pi-fw pi-user",
    items: [
      [
        {
          items: [
            {
              label: "View My Profile",
              to: {
                name: "UserProfileCard",
                params: { id: storeUser.state.user.id },
              },
            },
            { label: "Settings", to: { name: "UserSetting" } },
            { label: "Friends", to: { name: "Friends" } },
            { label: "Blocked", to: { name: "Blocked" } },
            { label: "Log Out", to: { name: "LogOut" } },
          ],
        },
      ],
    ],
  },
]);
</script>
