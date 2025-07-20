import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import StyleClass from 'primevue/styleclass'
import Tooltip from 'primevue/tooltip'
import ToastService from 'primevue/toastservice'
import 'primeicons/primeicons.css'
import App from './App.vue'
import './assets/main.css'
import { definePreset } from '@primevue/themes'

const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{amber.50}',
            100: '{amber.100}',
            200: '{amber.200}',
            300: '{amber.300}',
            400: '{amber.400}',
            500: '{amber.500}',
            600: '{amber.600}',
            700: '{amber.700}',
            800: '{amber.800}',
            900: '{amber.900}',
            950: '{amber.950}'
        }
    }
})

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: MyPreset,
        options: {
            darkModeSelector: '.dark',
        }
    }
})
app.use(ToastService)
app.directive('styleclass', StyleClass)
app.directive('tooltip', Tooltip)

app.mount('#app')
