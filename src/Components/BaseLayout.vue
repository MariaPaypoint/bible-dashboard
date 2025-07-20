<template>
    <div class="h-screen flex relative lg:static bg-surface-50 dark:bg-surface-950">
        <div id="app-sidebar-13"
            class="w-[280px] bg-surface-50 dark:bg-surface-950 h-screen hidden lg:block flex-shrink-0 absolute lg:fixed left-0 top-0 z-10 select-none shadow-lg lg:shadow-none">
            <div class="flex flex-col h-full lg:py-8">
                <div class="flex items-center justify-start px-4 py-4">
                    <div class="flex items-center gap-4">
                        <img src="@/assets/logo.png" alt="Logo" width="32" height="32" class="flex-shrink-0" />
                        <span
                            class="text-lg font-semibold leading-tight text-surface-900 dark:text-surface-0">Bible Forced Alignments</span>
                    </div>
                </div>
                <div class="flex-1 overflow-y-auto p-2 flex flex-col gap-4">
                    <ul class="list-none p-0 m-0 flex flex-col gap-1">
                        <li>
                            <div v-styleclass="{
                                selector: '@next',
                                enterFromClass: 'hidden',
                                enterActiveClass: 'animate-slidedown',
                                leaveToClass: 'hidden',
                                leaveActiveClass: 'animate-slideup'
                            }"
                                class="flex items-center cursor-pointer p-3 gap-4 rounded-md text-surface-900 dark:text-surface-0 hover:bg-surface-100 dark:hover:bg-surface-800 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 transition-colors duration-150">
                                <span class="font-semibold text-base leading-tight">Bibles</span>
                                <i
                                    class="pi pi-chevron-down !text-sm !leading-none text-surface-500 dark:text-surface-400 ml-auto" />
                            </div>
                            <ul class="list-none p-0 m-0 overflow-hidden flex flex-col gap-1">
                                <li>
                                    <a @click="setActiveComponent('bible_voices')"
                                        :class="[
                                            'flex items-center cursor-pointer p-3 gap-2 rounded-lg transition-colors duration-150 border group',
                                            activeComponent === 'bible_voices' 
                                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800' 
                                                : 'text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-50 border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700'
                                        ]">
                                        <i
                                            :class="[
                                                'pi pi-headphones !text-base !leading-none',
                                                activeComponent === 'bible_voices'
                                                    ? 'text-primary-600 dark:text-primary-400'
                                                    : 'text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50'
                                            ]" />
                                        <span class="font-medium text-base leading-tight">Voices</span>
                                    </a>
                                </li>
                                <li>
                                    <a @click="setActiveComponent('bible_anomalies')"
                                        :class="[
                                            'flex items-center cursor-pointer p-3 gap-2 rounded-lg transition-colors duration-150 border group',
                                            activeComponent === 'bible_anomalies' 
                                                ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800' 
                                                : 'text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-50 border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700'
                                        ]">
                                        <i
                                            :class="[
                                                'pi pi-exclamation-triangle !text-base !leading-none',
                                                activeComponent === 'bible_anomalies'
                                                    ? 'text-primary-600 dark:text-primary-400'
                                                    : 'text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50'
                                            ]" />
                                        <span class="font-medium text-base leading-tight">Anomalies</span>
                                        <Badge value="2" severity="contrast"
                                            class="ml-auto !h-5 !min-w-5 !text-xs !font-bold !leading-tight !rounded-xl" />
                                    </a>
                                </li>
                                
                                <!-- <li>
                                    <a
                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                        <i
                                            class="pi pi-calendar !text-base !leading-none text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                        <span class="font-medium text-base leading-tight">Events</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                        <i
                                            class="pi pi-comment !text-base !leading-none text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                        <span class="font-medium text-base leading-tight">Chat</span>
                                        <Badge value="5" severity="secondary"
                                            class="ml-auto !h-5 !min-w-5 !text-xs !font-bold !leading-tight !rounded-xl" />
                                    </a>
                                </li>
                                <li>
                                    <a v-styleclass="{
                                        selector: '@next',
                                        enterFromClass: 'hidden',
                                        enterActiveClass: 'animate-slidedown',
                                        leaveToClass: 'hidden',
                                        leaveActiveClass: 'animate-slideup'
                                    }"
                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                        <i
                                            class="pi pi-shield !text-base !leading-none text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                        <span class="font-medium text-base leading-tight">Security</span>
                                        <i
                                            class="pi pi-chevron-down !text-sm !leading-none text-surface-500 dark:text-surface-400 ml-auto" />
                                    </a>
                                    <ul
                                        class="list-none py-0 pl-8 pr-0 m-0 hidden overflow-y-hidden transition-all duration-[400ms] ease-in-out flex flex-col gap-1 mt-1">
                                        <li>
                                            <a v-styleclass="{
                                                selector: '@next',
                                                enterFromClass: 'hidden',
                                                enterActiveClass: 'animate-slidedown',
                                                leaveToClass: 'hidden',
                                                leaveActiveClass: 'animate-slideup'
                                            }"
                                                class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                                <i
                                                    class="pi pi-lock !text-base !leading-none text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                                <span class="font-medium text-base leading-tight">Permissions</span>
                                                <i
                                                    class="pi pi-chevron-down ml-auto !text-sm !leading-none text-surface-500 dark:text-surface-400" />
                                            </a>
                                            <ul
                                                class="list-none py-0 pl-8 pr-0 m-0 hidden overflow-y-hidden transition-all duration-[400ms] ease-in-out flex flex-col gap-1 mt-1">
                                                <li>
                                                    <a
                                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                                        <i
                                                            class="pi pi-users !text-base !leading-none text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                                        <span class="font-medium text-base leading-tight">User
                                                            Access</span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a
                                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                                        <i
                                                            class="pi pi-history !text-base !leading-none text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                                        <span class="font-medium text-base leading-tight">Audit
                                                            Log</span>
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                        <li>
                                            <a
                                                class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                                <i
                                                    class="pi pi-bell !text-base !leading-none text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                                <span class="font-medium text-base leading-tight">Alerts</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                            -->
                            </ul>
                        </li>
                    </ul>
                    <!-- 
                    <div class="h-px bg-surface-200 dark:bg-surface-700" />

                    <ul class="list-none p-0 m-0 flex flex-col gap-1">
                        <li>
                            <div v-styleclass="{
                                selector: '@next',
                                enterFromClass: 'hidden',
                                enterActiveClass: 'animate-slidedown',
                                leaveToClass: 'hidden',
                                leaveActiveClass: 'animate-slideup'
                            }"
                                class="flex items-center cursor-pointer p-3 gap-4 rounded-md text-surface-900 dark:text-surface-0 hover:bg-surface-100 dark:hover:bg-surface-800 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 transition-colors duration-150">
                                <span class="font-semibold text-base leading-tight">My Projects</span>
                                <i
                                    class="pi pi-chevron-down !text-sm !leading-none text-surface-500 dark:text-surface-400 ml-auto" />
                            </div>
                            <ul class="list-none p-0 m-0 overflow-hidden flex flex-col gap-1">
                                <li>
                                    <a
                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                        <span
                                            class="flex items-center justify-center p-1 bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-md">
                                            <i
                                                class="pi pi-globe !text-xs !leading-none text-blue-600 dark:text-blue-300" />
                                        </span>
                                        <span class="font-medium text-base leading-tight">E-Commerce Platform</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-100 dark:hover:border-surface-700 group">
                                        <span
                                            class="flex items-center justify-center p-1 bg-emerald-100 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 rounded-md">
                                            <i
                                                class="pi pi-mobile !text-xs !leading-none text-emerald-600 dark:text-emerald-300" />
                                        </span>
                                        <span class="font-medium text-base leading-tight">Mobile App</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                        <span
                                            class="flex items-center justify-center p-1 bg-purple-100 dark:bg-purple-900 border border-purple-200 dark:border-purple-800 rounded-md">
                                            <i
                                                class="pi pi-chart-bar !text-xs !leading-none text-purple-600 dark:text-purple-300" />
                                        </span>
                                        <span class="font-medium text-base leading-tight">Analytics Dashboard</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                        <span
                                            class="flex items-center justify-center p-1 bg-rose-100 dark:bg-rose-900 border border-rose-200 dark:border-rose-800 rounded-md">
                                            <i
                                                class="pi pi-cloud !text-xs !leading-none text-rose-600 dark:text-rose-300" />
                                        </span>
                                        <span class="font-medium text-base leading-tight">Cloud Storage</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                        <span
                                            class="flex items-center justify-center p-1 bg-primary-100 dark:bg-primary-900 border border-primary-200 dark:border-primary-800 rounded-md">
                                            <i
                                                class="pi pi-shield !text-xs !leading-none text-primary-600 dark:text-primary-300" />
                                        </span>
                                        <span class="font-medium text-base leading-tight">Security System</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                    -->
                </div>

                <div class="p-2">
                    <ul class="list-none p-0 m-0 flex flex-col gap-1">
                        <li>
                            <a
                                class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                <i
                                    class="pi pi-cog !text-base !leading-none text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                <span class="font-medium text-base leading-tight">Settings</span>
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="h-screen flex flex-col flex-auto bg-surface-50 dark:bg-surface-950 p-5 md:p-8 lg:pl-2 lg:ml-[280px] overflow-hidden">
            <div
                class="bg-surface-0 dark:bg-surface-900 flex flex-col flex-auto rounded-xl shadow-md border border-surface-200 dark:border-surface-700 overflow-hidden">
                <!-- Main Content Area - full height scrollable -->
                <div class="flex-auto overflow-y-auto p-8">
                    <!-- Mobile menu and controls - inside scrollable area -->
                    <div class="flex justify-between items-center mb-8 lg:hidden">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">{{ pageTitle.icon }}</span>
                            <h1 class="text-xl font-semibold text-surface-900 dark:text-surface-0">{{ pageTitle.title }}</h1>
                        </div>
                        <div class="flex items-center gap-2">
                            <a v-styleclass="{
                                selector: '#app-sidebar-13',
                                enterFromClass: 'hidden',
                                enterActiveClass: 'animate-fadeinleft',
                                leaveToClass: 'hidden',
                                leaveActiveClass: 'animate-fadeoutleft',
                                hideOnOutsideClick: true
                            }" class="cursor-pointer text-surface-700 dark:text-surface-100">
                                <i class="pi pi-bars !text-xl !leading-none" />
                            </a>
                            <button @click="toggleDarkMode()"
                                class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-200">
                                <i class="pi text-surface-700 dark:text-surface-300" style="font-size: 1.4rem"
                                    :class="{ 'pi-sun': isDarkMode, 'pi-moon': !isDarkMode }" />
                            </button>
                        </div>
                    </div>
                    
                    <!-- Desktop header - inside scrollable area -->
                    <div class="hidden lg:flex justify-between items-center mb-8">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">{{ pageTitle.icon }}</span>
                            <h1 class="text-xl font-semibold text-surface-900 dark:text-surface-0">{{ pageTitle.title }}</h1>
                        </div>
                        <button @click="toggleDarkMode()"
                            class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-200">
                            <i class="pi text-surface-700 dark:text-surface-300" style="font-size: 1.4rem"
                                :class="{ 'pi-sun': isDarkMode, 'pi-moon': !isDarkMode }" />
                        </button>
                    </div>
                    
                    <Welcome v-if="activeComponent === 'welcome'" @navigate="setActiveComponent" />
                    <BibleVoices v-else-if="activeComponent === 'bible_voices'" />
                    <BibleAnomalies v-else-if="activeComponent === 'bible_anomalies'" />
                </div>
            </div>
        </div>
    </div>
    <Toast />
</template>

<script setup lang="ts">
import Badge from 'primevue/badge'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import { ref, onMounted, computed } from 'vue'
import type { ActiveComponent } from '../types/components'

// Import components
import Welcome from './Welcome.vue'
import BibleVoices from './BibleVoices.vue'
import BibleAnomalies from './BibleAnomalies.vue'

const isDarkMode = ref<boolean>(false)
const activeComponent = ref<ActiveComponent>('welcome')

// Dynamic page title based on active component
const pageTitle = computed(() => {
  switch (activeComponent.value) {
    case 'welcome':
      return { icon: '👋', title: 'Welcome!' }
    case 'bible_voices':
      return { icon: '🎧', title: 'Voices' }
    case 'bible_anomalies':
      return { icon: '⚠️', title: 'Anomalies' }
    default:
      return { icon: '👋', title: 'Welcome!' }
  }
})

onMounted(() => {
    // Проверяем системные настройки темы
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    // Если тема еще не выбрана, устанавливаем системную
    if (prefersDark && !document.documentElement.classList.contains('dark')) {
        document.documentElement.classList.add('dark');
    }

    // Обновляем состояние иконки
    isDarkMode.value = document.documentElement.classList.contains('dark');

    // Добавляем отслеживание изменений системной темы
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
        if (!e.matches) {
            document.documentElement.classList.remove('dark');
        } else {
            document.documentElement.classList.add('dark');
        }
        isDarkMode.value = document.documentElement.classList.contains('dark');
    });
});

function toggleDarkMode(): void {
    document.documentElement.classList.toggle('dark')
    // Обновляем состояние для иконки
    isDarkMode.value = document.documentElement.classList.contains('dark')
}

function setActiveComponent(component: ActiveComponent): void {
    activeComponent.value = component
}
</script>
