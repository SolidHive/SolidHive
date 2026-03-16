import { createApp } from 'vue';
import './style.css';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './routes/index.ts';
import Toast from 'vue-toastification';
import 'vue-toastification/dist/index.css';
import { QuillEditor } from '@vueup/vue-quill';
import '@vueup/vue-quill/dist/vue-quill.snow.css';

const app = createApp(App);
const pinia = createPinia();

app.component('QuillEditor', QuillEditor);

app.use(pinia);
app.use(router);
app.use(Toast);

app.mount('#app');
