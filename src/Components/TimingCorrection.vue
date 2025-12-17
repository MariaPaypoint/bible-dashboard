<template>
  <div class="pt-4 mt-2 border-t border-surface-200 dark:border-surface-700 space-y-3">
    <div class="text-sm font-medium text-surface-900 dark:text-surface-0 mb-3">
      Adjust Verse Timing
    </div>

    <!-- Start Time Controls -->
    <div class="flex items-center justify-between">
      <span class="text-sm text-surface-700 dark:text-surface-200">Start Time:</span>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1">
          <!-- Very fast decrease -->
          <Button @click="adjustStart(-1.0)" severity="secondary" size="small"
            class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'-1.0s'">
            <span class="text-2xl font-bold leading-none" style="margin-top: -2px;">-</span>
          </Button>
          <!-- Fast decrease -->
          <Button @click="adjustStart(-0.1)" severity="secondary" size="small"
            class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'-0.1s'">
            <span class="text-lg font-bold leading-none" style="margin-top: -1px;">-</span>
          </Button>
          <!-- Fine decrease -->
          <Button @click="adjustStart(-0.01)" severity="secondary" size="small"
            class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'-0.01s'"
            data-testid="start-decrease-fine">
            <span class="text-xs font-bold leading-none">-</span>
          </Button>
          <!-- Time display -->
          <span
            class="text-sm font-mono min-w-[80px] text-center bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded mx-1">
            {{ formatTimeWithMs(startTime) }}
          </span>
          <!-- Fine increase -->
          <Button @click="adjustStart(0.01)" severity="secondary" size="small"
            class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'+0.01s'"
            data-testid="start-increase-fine">
            <span class="text-xs font-bold leading-none">+</span>
          </Button>
          <!-- Fast increase -->
          <Button @click="adjustStart(0.1)" severity="secondary" size="small"
            class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'+0.1s'">
            <span class="text-lg font-bold leading-none" style="margin-top: -1px;">+</span>
          </Button>
          <!-- Very fast increase -->
          <Button @click="adjustStart(1.0)" severity="secondary" size="small"
            class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'+1.0s'">
            <span class="text-2xl font-bold leading-none" style="margin-top: -2px;">+</span>
          </Button>
        </div>
        <!-- Preview button for Start Time -->
        <Button @click="$emit('preview-start')" severity="info" size="small" class="px-2 py-1"
          v-tooltip.top="'Preview start time'"
          data-testid="preview-start-button">
          <PlayIcon class="w-3 h-3" />
        </Button>
      </div>
    </div>

    <!-- End Time Controls -->
    <div class="flex items-center justify-between">
      <span class="text-sm text-surface-700 dark:text-surface-200">End Time:</span>
      <div class="flex items-center gap-2">
        <div class="flex items-center gap-1">
          <!-- Very fast decrease -->
          <Button @click="adjustEnd(-1.0)" severity="secondary" size="small"
            class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'-1.0s'">
            <span class="text-2xl font-bold leading-none" style="margin-top: -2px;">-</span>
          </Button>
          <!-- Fast decrease -->
          <Button @click="adjustEnd(-0.1)" severity="secondary" size="small"
            class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'-0.1s'">
            <span class="text-lg font-bold leading-none" style="margin-top: -1px;">-</span>
          </Button>
          <!-- Fine decrease -->
          <Button @click="adjustEnd(-0.01)" severity="secondary" size="small"
            class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'-0.01s'"
            data-testid="end-decrease-fine">
            <span class="text-xs font-bold leading-none">-</span>
          </Button>
          <!-- Time display -->
          <span
            class="text-sm font-mono min-w-[80px] text-center bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded mx-1">
            {{ formatTimeWithMs(endTime) }}
          </span>
          <!-- Fine increase -->
          <Button @click="adjustEnd(0.01)" severity="secondary" size="small"
            class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'+0.01s'"
            data-testid="end-increase-fine">
            <span class="text-xs font-bold leading-none">+</span>
          </Button>
          <!-- Fast increase -->
          <Button @click="adjustEnd(0.1)" severity="secondary" size="small"
            class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'+0.1s'">
            <span class="text-lg font-bold leading-none" style="margin-top: -1px;">+</span>
          </Button>
          <!-- Very fast increase -->
          <Button @click="adjustEnd(1.0)" severity="secondary" size="small"
            class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'+1.0s'">
            <span class="text-2xl font-bold leading-none" style="margin-top: -2px;">+</span>
          </Button>
        </div>
        <!-- Preview button for End Time -->
        <Button @click="$emit('preview-end')" severity="info" size="small" class="px-2 py-1"
          v-tooltip.top="'Preview end time'"
          data-testid="preview-end-button">
          <PlayIcon class="w-3 h-3" />
        </Button>
      </div>
    </div>

    <!-- Slot for additional content (e.g., timing overlap warnings) -->
    <slot name="warnings" />

    <!-- Action Buttons -->
    <div class="flex gap-2 pt-2">
      <Button @click="$emit('apply')" severity="success" size="small" class="flex-1"
        :disabled="!hasChanges"
        data-testid="apply-correction-button">
        Apply Corrections
      </Button>
      <Button @click="$emit('reset')" severity="secondary" size="small" class="flex-1"
        data-testid="reset-correction-button">
        Reset
      </Button>
      <Button @click="$emit('close')" severity="secondary" size="small" class="flex-1"
        data-testid="close-correction-button">
        Close
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import { Play as PlayIcon } from 'lucide-vue-next'

// Props
const props = defineProps<{
  startTime: number
  endTime: number
  originalStartTime: number
  originalEndTime: number
}>()

// Emits
const emit = defineEmits<{
  'update:startTime': [value: number]
  'update:endTime': [value: number]
  'preview-start': []
  'preview-end': []
  'apply': []
  'reset': []
  'close': []
}>()

// Computed
const hasChanges = computed(() => {
  return props.startTime !== props.originalStartTime || props.endTime !== props.originalEndTime
})

// Methods
const adjustStart = (delta: number) => {
  const newValue = props.startTime + delta
  if (newValue >= 0 && newValue < props.endTime) {
    emit('update:startTime', newValue)
  }
}

const adjustEnd = (delta: number) => {
  const newValue = props.endTime + delta
  if (newValue > props.startTime) {
    emit('update:endTime', newValue)
  }
}

const formatTimeWithMs = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}
</script>
