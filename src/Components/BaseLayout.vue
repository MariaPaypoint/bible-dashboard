<template>
    <div class="h-screen flex relative lg:static bg-surface-50 dark:bg-surface-950">
        <div id="app-sidebar-13"
            class="w-[280px] bg-surface-50 dark:bg-surface-950 h-screen hidden lg:block flex-shrink-0 absolute lg:fixed left-0 top-0 z-10 select-none shadow-lg lg:shadow-none">
            <div class="flex flex-col h-full lg:py-8">
                <div class="flex items-center justify-start px-4 py-4">
                    <div class="flex items-center gap-4">
                        <img src="@/assets/logo.png" alt="Logo" width="32" height="32" class="flex-shrink-0" />
                        <span class="text-lg font-semibold leading-tight text-surface-900 dark:text-surface-0">Bible
                            Forced Alignments</span>
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
                                <ChevronDown class="w-5 h-5 text-surface-500 dark:text-surface-400 ml-auto" />
                            </div>
                            <ul class="list-none p-0 m-0 overflow-hidden flex flex-col gap-1">
                                <li>
                                    <a @click="setActiveComponent('bible_voices')" :class="[
                                        'flex items-center cursor-pointer p-3 gap-2 rounded-lg transition-colors duration-150 border group',
                                        activeComponent === 'bible_voices'
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                                            : 'text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-50 border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700'
                                    ]">
                                        <VoiceIcon :class="[
                                            'w-5 h-5',
                                            activeComponent === 'bible_voices'
                                                ? 'text-primary-600 dark:text-primary-400'
                                                : 'text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50'
                                        ]" />
                                        <span class="font-medium text-base leading-tight">Voices</span>
                                    </a>
                                </li>
                                <li>
                                    <a @click="setActiveComponent('bible_anomalies')" :class="[
                                        'flex items-center cursor-pointer p-3 gap-2 rounded-lg transition-colors duration-150 border group',
                                        activeComponent === 'bible_anomalies'
                                            ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 border-primary-200 dark:border-primary-800'
                                            : 'text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 hover:text-surface-900 dark:hover:text-surface-50 border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700'
                                    ]">
                                        <AlertTriangle :class="[
                                            'w-5 h-5',
                                            activeComponent === 'bible_anomalies'
                                                ? 'text-primary-600 dark:text-primary-400'
                                                : 'text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50'
                                        ]" />
                                        <span class="font-medium text-base leading-tight">Anomalies</span>
                                        <Badge value="2" severity="contrast"
                                            class="ml-auto !h-5 !min-w-5 !text-xs !font-bold !leading-tight !rounded-xl" />
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>

                    <!-- Theme Toggle - Mobile Only -->
                    <div class="h-px bg-surface-200 dark:bg-surface-700 lg:hidden" />
                    <ul class="list-none p-0 m-0 flex flex-col gap-1 lg:hidden">
                        <li>
                            <a @click="toggleDarkMode()"
                                class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                <i :class="[
                                    'pi !text-base !leading-none',
                                    isDarkMode ? 'pi-sun' : 'pi-moon',
                                    'text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50'
                                ]" />
                                <span class="font-medium text-base leading-tight">
                                    {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
                                </span>
                            </a>
                        </li>
                    </ul>

                    <!-- <div class="h-px bg-surface-200 dark:bg-surface-700" />
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
                                <ChevronDown
                                    class="w-5 h-5 text-surface-500 dark:text-surface-400 ml-auto" />
                            </div>
                            <ul class="list-none p-0 m-0 overflow-hidden flex flex-col gap-1">
                                <li>
                                    <a
                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                        <Calendar
                                            class="w-5 h-5 text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                        <span class="font-medium text-base leading-tight">Events</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                        <MessageSquare
                                            class="w-5 h-5 text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
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
                                        <Shield
                                            class="w-5 h-5 text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                        <span class="font-medium text-base leading-tight">Security</span>
                                        <ChevronDown
                                            class="w-5 h-5 text-surface-500 dark:text-surface-400 ml-auto" />
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
                                                <Lock
                                                    class="w-5 h-5 text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                                <span class="font-medium text-base leading-tight">Permissions</span>
                                                <ChevronDown
                                                    class="w-5 h-5 ml-auto text-surface-500 dark:text-surface-400" />
                                            </a>
                                            <ul
                                                class="list-none py-0 pl-8 pr-0 m-0 hidden overflow-y-hidden transition-all duration-[400ms] ease-in-out flex flex-col gap-1 mt-1">
                                                <li>
                                                    <a
                                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                                        <Users
                                                            class="w-5 h-5 text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                                        <span class="font-medium text-base leading-tight">User
                                                            Access</span>
                                                    </a>
                                                </li>
                                                <li>
                                                    <a
                                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                                        <Clock
                                                            class="w-5 h-5 text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                                        <span class="font-medium text-base leading-tight">Audit
                                                            Log</span>
                                                    </a>
                                                </li>
                                            </ul>
                                        </li>
                                        <li>
                                            <a
                                                class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                                <Bell
                                                    class="w-5 h-5 text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                                <span class="font-medium text-base leading-tight">Alerts</span>
                                            </a>
                                        </li>
                                    </ul>
                                </li>
                            -->
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
                                <ChevronDown class="w-5 h-5 text-surface-500 dark:text-surface-400 ml-auto" />
                            </div>
                            <ul class="list-none p-0 m-0 overflow-hidden flex flex-col gap-1">
                                <li>
                                    <a
                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                        <span
                                            class="flex items-center justify-center p-1 bg-blue-100 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-md">
                                            <Globe
                                                class="w-3 h-3 text-blue-600 dark:text-blue-300" />
                                        </span>
                                        <span class="font-medium text-base leading-tight">E-Commerce Platform</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-100 dark:hover:border-surface-700 group">
                                        <span
                                            class="flex items-center justify-center p-1 bg-emerald-100 dark:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 rounded-md">
                                            <Smartphone
                                                class="w-3 h-3 text-emerald-600 dark:text-emerald-300" />
                                        </span>
                                        <span class="font-medium text-base leading-tight">Mobile App</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                        <span
                                            class="flex items-center justify-center p-1 bg-purple-100 dark:bg-purple-900 border border-purple-200 dark:border-purple-800 rounded-md">
                                            <BarChart3
                                                class="w-3 h-3 text-purple-600 dark:text-purple-300" />
                                        </span>
                                        <span class="font-medium text-base leading-tight">Analytics Dashboard</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                        <span
                                            class="flex items-center justify-center p-1 bg-rose-100 dark:bg-rose-900 border border-rose-200 dark:border-rose-800 rounded-md">
                                            <Cloud
                                                class="w-3 h-3 text-rose-600 dark:text-rose-300" />
                                        </span>
                                        <span class="font-medium text-base leading-tight">Cloud Storage</span>
                                    </a>
                                </li>
                                <li>
                                    <a
                                        class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                        <span
                                            class="flex items-center justify-center p-1 bg-primary-100 dark:bg-primary-900 border border-primary-200 dark:border-primary-800 rounded-md">
                                            <Shield
                                                class="w-3 h-3 text-primary-600 dark:text-primary-300" />
                                        </span>
                                        <span class="font-medium text-base leading-tight">Security System</span>
                                    </a>
                                </li>
                            </ul>
                        </li>
                    </ul>
                    -->
                </div>

                <div class="p-2 hidden lg:block">
                    <ul class="list-none p-0 m-0 flex flex-col gap-1">
                        <li class="relative settings-menu-container">
                            <a @click="toggleSettingsMenu"
                                class="flex items-center cursor-pointer p-3 gap-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 border border-transparent hover:border hover:border-surface-200 dark:hover:border-surface-700 group">
                                <Settings
                                    class="w-5 h-5 text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                <span class="font-medium text-base leading-tight">Settings</span>
                                <ChevronUp
                                    class="w-5 h-5 text-surface-500 dark:text-surface-400 ml-auto transition-transform duration-200"
                                    :class="{ 'rotate-180': !showSettingsMenu }" />
                            </a>

                            <!-- Settings Dropdown Menu -->
                            <div v-show="showSettingsMenu"
                                class="absolute bottom-full left-0 mb-2 w-full bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-lg shadow-lg z-50">
                                <ul class="list-none p-2 m-0 flex flex-col gap-1">
                                    <li>
                                        <a @click="setTheme('light')"
                                            class="flex items-center cursor-pointer p-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 group">
                                            <Sun
                                                class="w-5 h-5 text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                            <span class="ml-2 font-medium text-sm">Light Theme</span>
                                            <Check v-if="!isDarkMode"
                                                class="w-5 h-5 text-primary-600 dark:text-primary-400 ml-auto" />
                                        </a>
                                    </li>
                                    <li>
                                        <a @click="setTheme('dark')"
                                            class="flex items-center cursor-pointer p-2 rounded-lg text-surface-700 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-150 hover:text-surface-900 dark:hover:text-surface-50 group">
                                            <Moon
                                                class="w-4 h-4 text-surface-500 dark:text-surface-400 group-hover:text-surface-900 dark:group-hover:text-surface-50" />
                                            <span class="ml-2 font-medium text-sm">Dark Theme</span>
                                            <Check v-if="isDarkMode"
                                                class="w-4 h-4 text-primary-600 dark:text-primary-400 ml-auto" />
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <div
            class="h-screen flex flex-col flex-auto bg-surface-50 dark:bg-surface-950 p-5 md:p-8 lg:pl-2 lg:ml-[280px] overflow-hidden">
            <div
                class="bg-surface-0 dark:bg-surface-900 flex flex-col flex-auto rounded-xl shadow-md border border-surface-200 dark:border-surface-700 overflow-hidden">
                <!-- Main Content Area - full height scrollable -->
                <div class="flex-auto overflow-y-auto p-5 md:p-8">
                    <!-- Mobile menu and controls - inside scrollable area -->
                    <div class="flex justify-between items-center mb-8 lg:hidden">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">{{ pageTitle.icon }}</span>
                            <h1 class="text-xl font-semibold text-surface-900 dark:text-surface-0">{{ pageTitle.title }}
                            </h1>
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
                                <Menu class="w-6 h-6" />
                            </a>
                        </div>
                    </div>

                    <!-- Desktop header - inside scrollable area -->
                    <div class="hidden lg:flex justify-between items-center mb-8">
                        <div class="flex items-center gap-3">
                            <span class="text-2xl">{{ pageTitle.icon }}</span>
                            <h1 class="text-xl font-semibold text-surface-900 dark:text-surface-0">{{ pageTitle.title }}
                            </h1>
                        </div>
                        <button @click="toggleDarkMode()"
                            class="flex items-center justify-center w-10 h-10 rounded-full hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors duration-200">
                            <component :is="isDarkMode ? Sun : Moon"
                                class="w-6 h-6 text-surface-700 dark:text-surface-300" />
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
import { ref, onMounted, onUnmounted, computed } from 'vue'
import type { ActiveComponent } from '../types/components'

// Import components
import Welcome from './Welcome.vue'
import BibleVoices from './BibleVoices.vue'
import BibleAnomalies from './BibleAnomalies.vue'

// Lucide imports
import {
    ChevronDown,
    ChevronUp,
    Volume2 as VoiceIcon,
    AlertTriangle,
    Calendar,
    MessageSquare,
    Shield,
    Lock,
    Users,
    Clock,
    Bell,
    Globe,
    Smartphone,
    BarChart3,
    Cloud,
    Settings,
    Sun,
    Moon,
    Check,
    Menu
} from 'lucide-vue-next'

const isDarkMode = ref<boolean>(false)
const activeComponent = ref<ActiveComponent>('welcome')
const showSettingsMenu = ref<boolean>(false)

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

// Handle click outside to close settings menu
const handleClickOutside = (event: Event) => {
    const target = event.target as Element
    if (!target.closest('.settings-menu-container')) {
        showSettingsMenu.value = false
    }
}

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

    // Add click outside listener
    document.addEventListener('click', handleClickOutside)
});

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
});

function toggleDarkMode(): void {
    document.documentElement.classList.toggle('dark')
    // Обновляем состояние для иконки
    isDarkMode.value = document.documentElement.classList.contains('dark')
}

function setActiveComponent(component: ActiveComponent): void {
    activeComponent.value = component
}

function toggleSettingsMenu(): void {
    showSettingsMenu.value = !showSettingsMenu.value
}

function setTheme(theme: 'light' | 'dark'): void {
    if (theme === 'dark') {
        document.documentElement.classList.add('dark')
    } else {
        document.documentElement.classList.remove('dark')
    }
    isDarkMode.value = document.documentElement.classList.contains('dark')
    showSettingsMenu.value = false // Close menu after selection
}
</script>
