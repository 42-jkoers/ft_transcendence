<template>
  <MegaMenu :model="MenuItems" />
</template>
<script setup lang="ts">
import { ref } from "vue";
import MegaMenu from "primevue/megamenu";
const MenuItems = ref([
  {
    label: "Home",
    icon: "pi pi-fw pi-home",
    to: { name: "UserHome" },
  },
  {
    label: "Chat",
    icon: "pi pi-fw pi-comments",
    items: [
      [
        {
          items: [
            { label: "Chat 1", to: { name: "Chat" } },
            { label: "Chat 2", to: { name: "Chat" } },
          ],
        },
      ],
    ],
  },
  {
    label: "Game",
    icon: "pi pi-fw pi-discord",
    items: [
      [
        {
          items: [
            { label: "Game 1", to: { name: "ComingSoon" } },
            { label: "Game 2", to: { name: "ComingSoon" } },
          ],
        },
      ],
    ],
  },
  {
    label: "Profile",
    icon: "pi pi-fw pi-user",
    items: [
      [
        {
          items: [
            { label: "View My Profile", to: { name: "ComingSoon" } },
            { label: "Settings", to: { name: "UserSetting" } },
            { label: "Log Out", to: { name: "LogOut" } },
          ],
        },
      ],
    ],
  },
]);
</script>
