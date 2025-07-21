<template>
    <div class="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-8">
        <div class="mb-8">
            <i class="pi pi-book text-6xl text-cyan-500 mb-4"></i>
            <h2 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-4">
                Welcome to Bible Dashboard
            </h2>
            <p class="text-lg text-surface-600 dark:text-surface-400 max-w-2xl">
                Manage and monitor your Bible forced alignments with ease. 
                Use the menu on the left to navigate through different sections.
            </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            <div @click="navigateToVoices" 
                 class="bg-surface-100 dark:bg-surface-800 p-6 rounded-lg cursor-pointer transition-all duration-200 hover:bg-surface-200 dark:hover:bg-surface-700 hover:shadow-lg">
                <i class="pi pi-volume-up text-2xl text-cyan-500 mb-3"></i>
                <h3 class="text-xl font-semibold mb-2 text-surface-900 dark:text-surface-0">Voices</h3>
                <p class="text-surface-600 dark:text-surface-400">
                    Manage Bible voice recordings and their active status.
                </p>
            </div>
            
            <div @click="navigateToAnomalies" 
                 class="bg-surface-100 dark:bg-surface-800 p-6 rounded-lg cursor-pointer transition-all duration-200 hover:bg-surface-200 dark:hover:bg-surface-700 hover:shadow-lg">
                <i class="pi pi-exclamation-triangle text-2xl text-orange-500 mb-3"></i>
                <h3 class="text-xl font-semibold mb-2 text-surface-900 dark:text-surface-0">Anomalies</h3>
                <p class="text-surface-600 dark:text-surface-400">
                    Analyze and monitor voice anomalies in Bible recordings.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import type { ActiveComponent } from '../types/components'

// Define emit for component navigation
const emit = defineEmits<{
  navigate: [component: ActiveComponent]
}>()

const navigateToVoices = () => {
  emit('navigate', 'bible_voices')
}

const navigateToAnomalies = () => {
  emit('navigate', 'bible_anomalies')
}
</script>
