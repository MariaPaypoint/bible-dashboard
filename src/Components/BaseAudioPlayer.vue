<template>
  <div v-if="visible"
    class="fixed top-4 right-4 w-[420px] bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-lg p-7 transition-all duration-500 ease-in-out"
    :style="{ zIndex: zIndex }">
    <div class="flex flex-col gap-3">
      <!-- Header -->
      <div class="flex items-start justify-between">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-400/20 flex items-center justify-center">
            <SpeakerIcon class="w-5 h-5 text-primary-600 dark:text-primary-400" />
          </div>
          <div>
            <div class="text-base font-semibold text-surface-900 dark:text-surface-0 leading-normal">
              {{ title }}
            </div>
            <div class="text-xs text-surface-500 dark:text-surface-300 leading-tight">
              {{ subtitle }}
            </div>
          </div>
        </div>

        <!-- Control buttons -->
        <div class="flex gap-2 -mt-1 -mr-1">
          <Button severity="primary" class="w-10 h-10 !p-2" @click="$emit('toggle-play-pause')">
            <!-- Pause icon -->
            <svg v-if="isPlaying" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="6" y="4" width="4" height="16"></rect>
              <rect x="14" y="4" width="4" height="16"></rect>
            </svg>
            <!-- Play icon -->
            <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
          </Button>

          <!-- Slot for extra header buttons (e.g., Navigation menu) -->
          <slot name="header-extra" />

          <Button severity="secondary" class="w-10 h-10 !p-2" @click="$emit('close')" v-tooltip.top="'Stop'">
            <CloseIcon class="w-5 h-5" />
          </Button>
        </div>
      </div>

      <!-- Content text -->
      <div v-if="contentHtml"
        class="text-sm text-surface-700 dark:text-surface-200 leading-relaxed"
        v-html="contentHtml" />

      <!-- Slot for warnings (e.g., timing overlap warnings) -->
      <slot name="warnings" />

      <!-- Progress bar -->
      <div class="flex flex-col gap-2">
        <div
          class="relative h-1.5 rounded-lg overflow-hidden cursor-pointer hover:h-2 transition-all duration-200 bg-surface-200 dark:bg-surface-700"
          @click="handleProgressClick">
          <div class="absolute top-0 left-0 bg-primary h-full rounded-lg"
            :style="{ width: progressPercentage + '%' }" />
        </div>
        <div class="text-right text-xs text-surface-900 dark:text-surface-0 leading-tight">
          {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
        </div>
      </div>

      <!-- Slot for action buttons (e.g., Confirm/Disprove) -->
      <slot name="actions" />

      <!-- Slot for settings (e.g., Quick Check, Auto-advance) -->
      <slot name="settings" />

      <!-- Slot for correction interface -->
      <slot name="correction" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import {
  Volume2 as SpeakerIcon,
  X as CloseIcon
} from 'lucide-vue-next'

// Props
const props = withDefaults(defineProps<{
  visible: boolean
  title?: string
  subtitle?: string
  contentHtml?: string
  isPlaying: boolean
  currentTime: number
  duration: number
  progressPercentage: number
  zIndex?: number
}>(), {
  title: 'Playing Verse',
  zIndex: 1200
})

// Emits
const emit = defineEmits<{
  'toggle-play-pause': []
  'close': []
  'seek': [position: number]
}>()

// Format time helper
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const wholeSecs = Math.floor(seconds % 60)
  const fractionalPart = Math.round((seconds % 1) * 100)
  return `${mins}:${wholeSecs.toString().padStart(2, '0')}.${fractionalPart.toString().padStart(2, '0')}`
}

// Handle progress bar click
const handleProgressClick = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  const newPosition = props.duration * percentage
  emit('seek', newPosition)
}
</script>
