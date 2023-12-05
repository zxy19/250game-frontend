import '@/assets/main.css'
import { createApp } from 'vue'

import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'
import { useRegisterSW } from 'virtual:pwa-register/vue';

useRegisterSW();

const app = createApp(App)

app.use(router)

const pinia = createPinia();
app.use(pinia)
app.mount('#app')