/* eslint-disable prettier/prettier */
import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
app.config.errorHandler = (err) => { console.log(err); };
app.use(router);
app.mount("#app");
