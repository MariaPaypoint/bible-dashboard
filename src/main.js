import { createApp } from 'vue';
import PrimeVue from 'primevue/config';
import Aura from '@primevue/themes/aura';
import StyleClass from 'primevue/styleclass';
import 'primeicons/primeicons.css';
import App from './App.vue';
import './assets/main.css';

const app = createApp(App);
app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.dark',
        }
    }
});
app.directive('styleclass', StyleClass);


app.mount('#app');