import "./assets/main.css";

import { createVaporApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";

const app = createVaporApp(App);

app.use(createPinia());

app.mount("#app");
