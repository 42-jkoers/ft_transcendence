import { createWebHistory, createRouter } from "vue-router";
import Home from "@/views/Home.vue";
import Chat from "@/views/Chat.vue";

// Add a routing directory
const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/chat",
        name: "Chat",
        component: Chat,
    },
];

// Add the  configuration file:
const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
