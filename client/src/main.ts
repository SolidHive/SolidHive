import { createApp } from 'vue';
import './style.css';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './routes/index.ts';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import i18n from './i18n';

const app = createApp(App);
const pinia = createPinia();

app.use(pinia);
app.use(router);
app.use(Toast);
app.use(i18n);

app.mount('#app');
