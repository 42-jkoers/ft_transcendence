import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import PrimeVue from "primevue/config";
import "primevue/resources/themes/md-dark-indigo/theme.css"; //theme
import "primevue/resources/primevue.min.css"; //core css
import "primeicons/primeicons.css"; //icons
import "primeflex/primeflex.css"; //PrimeFlex
import ConfirmationService from "primevue/confirmationservice";
import ToastService from "primevue/toastservice";
import storeUser from "@/store";

const app = createApp(App);
app.use(storeUser);
app.use(router);
app.use(PrimeVue);
app.use(ConfirmationService);
app.use(ToastService);
app.mount("#app");
