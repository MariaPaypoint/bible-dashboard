<template>
  <div class="w-full">
    <!-- Voice Selection and Filters -->
    <div class="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-surface-800 dark:border-surface-700">
      <!-- Mobile: Stack vertically, Desktop: Horizontal layout -->
      <div class="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
        <div class="flex-1 min-w-0" style="flex: 2;">
          <Select id="voiceSelect" v-model="selectedVoice" :options="availableVoices" optionLabel="displayName"
            optionValue="code" :optionDisabled="isVoiceDisabled" placeholder="Select voice" class="w-full"
            @change="onVoiceChange">
            <template #option="slotProps">
              <div class="flex items-center justify-between w-full">
                <span :title="slotProps.option.displayName">
                  {{ slotProps.option.displayName }}
                </span>
              </div>
            </template>
            <template #value="slotProps">
              <div class="flex items-center justify-between w-full" v-if="slotProps.value">
                <span :title="getSelectedVoiceDisplayName(slotProps.value)">
                  {{ getSelectedVoiceDisplayName(slotProps.value) }}
                </span>
              </div>
            </template>
          </Select>
        </div>
        <div class="flex-1 min-w-0" style="flex: 1;">
          <Select id="bookFilter" v-model="selectedBookNumber" :options="bookOptions" optionLabel="label"
            optionValue="value" placeholder="All books" class="w-full" :disabled="!selectedVoice"
            :loading="booksState.loading" @change="onBookChange" showClear>
            <template #option="slotProps">
              <div class="flex items-center justify-between w-full">
                <span>
                  {{ slotProps.option.label }}
                </span>
              </div>
            </template>
            <template #value="slotProps">
              <div class="flex items-center justify-between w-full" v-if="slotProps.value">
                <span>
                  {{ getSelectedBookDisplayName(slotProps.value) }}
                </span>
              </div>
              <span v-else-if="slotProps.value">
                {{ getSelectedBookDisplayName(slotProps.value) }}
              </span>
            </template>
          </Select>
        </div>
        <div class="flex-1 min-w-0" style="flex: 1;">
          <InputNumber id="chapterFilter" v-model="selectedChapter" :min="1" :max="150" 
            placeholder="Chapter" class="w-full" :disabled="!selectedBookNumber"
            @blur="onChapterChange" @keyup.enter="onChapterChange" />
        </div>
        <div class="flex gap-3">
          <Button @click="refreshData" :disabled="!canLoadData" :loading="excerptState.loading" title="Refresh">
            <RefreshIcon class="w-5 h-5" />
          </Button>
        </div>
      </div>
    </div>

    <!-- Excerpt Table -->
    <DataTable :value="excerptVerses" tableStyle="min-width: 50rem" paginator :rows="defaultPageSize"
      :rowsPerPageOptions="[10, 15, 50, 100]" :totalRecords="excerptVerses?.length || 0" stripedRows
      :loading="excerptState.loading" :rowClass="getRowClass" class="compact-table">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span v-if="selectedVoice" class="text-sm text-gray-600">
              Voice: {{ getVoiceName(selectedVoice) }}
            </span>
            <span v-if="selectedBookNumber" class="text-sm text-gray-600">
              Book: {{ getSelectedBookDisplayName(selectedBookNumber) }}
            </span>
            <span v-if="selectedChapter" class="text-sm text-gray-600">
              Chapter: {{ selectedChapter }}
            </span>
          </div>
        </div>
      </template>

      <Column field="number" header="Verse" style="width: 8%">
        <template #body="slotProps">
          <span class="text-sm font-medium">{{ slotProps.data.number }}</span>
        </template>
      </Column>
      <Column field="html" header="Text" style="width: 45%">
        <template #body="slotProps">
          <div class="text-sm" v-html="slotProps.data.html"></div>
        </template>
      </Column>
      <Column field="begin" header="Start" style="width: 11%">
        <template #body="slotProps">
          <span class="text-sm font-mono">
            {{ formatTimeWithFraction(slotProps.data.begin).mainPart }}<span class="opacity-50">{{ formatTimeWithFraction(slotProps.data.begin).fractionPart }}</span>
          </span>
        </template>
      </Column>
      <Column field="end" header="End" style="width: 11%">
        <template #body="slotProps">
          <span class="text-sm font-mono">
            {{ formatTimeWithFraction(slotProps.data.end).mainPart }}<span class="opacity-50">{{ formatTimeWithFraction(slotProps.data.end).fractionPart }}</span>
          </span>
        </template>
      </Column>
      <Column header="Pause" style="width: 11%">
        <template #body="slotProps">
          <span v-if="calculatePauseToNext(slotProps.data) !== null" 
            class="text-sm font-mono text-surface-500 dark:text-surface-400">
            {{ formatPauseTime(calculatePauseToNext(slotProps.data)!).mainPart }}<span class="opacity-50">{{ formatPauseTime(calculatePauseToNext(slotProps.data)!).fractionPart }}</span>
          </span>
          <span v-else class="text-sm text-surface-400 dark:text-surface-500">—</span>
        </template>
      </Column>
      <Column header="Actions" style="width: 10%">
        <template #body="slotProps">
          <div class="flex gap-1">
            <!-- Dynamic Play/Pause button -->
            <Button v-if="currentPlayingId === slotProps.data.code && isPlaying" severity="primary" class="w-9 h-9"
              v-tooltip.top="'Pause'" @click="togglePlayPause()">
              <PauseIcon class="-m-1" />
            </Button>
            <Button v-else severity="info" class="w-9 h-9" v-tooltip.top="'Play Verse'"
              @click="playVerse(slotProps.data)">
              <PlayIcon class="-m-1" />
            </Button>
            <Button severity="secondary" class="w-9 h-9" v-tooltip.top="'Adjust Timing'"
              @click="initializeCorrectionInterface(slotProps.data)">
              <InfoIcon class="-m-1" />
            </Button>
          </div>
        </template>
      </Column>

      <template #footer>
        <div class="flex justify-between items-center">
          <span>Total verses: {{ excerptVerses ? excerptVerses.length : 0 }}</span>
          <span v-if="excerptState.error" class="text-red-500 text-sm">
            {{ excerptState.error }}
          </span>
        </div>
      </template>

      <template #empty>
        <div class="text-center py-8">
          <InfoIcon class="w-12 h-12 text-gray-400 mb-4 mx-auto" />
          <p class="text-gray-600">
            {{ selectedVoice ? 'Select book and chapter to view verses' : 'Select a voice to view verses' }}
          </p>
        </div>
      </template>
    </DataTable>

    <!-- Mini Audio Player Popup -->
    <div v-if="showPlayer"
      class="fixed top-4 right-4 w-[420px] bg-surface-0 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 rounded-2xl shadow-lg p-7 z-50 transition-all duration-500 ease-in-out">
      <div class="flex flex-col gap-3">
        <div class="flex items-start justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-full bg-primary-50 dark:bg-primary-400/20 flex items-center justify-center">
              <SpeakerIcon class="w-5 h-5 text-primary-600 dark:text-primary-400" />
            </div>
            <div>
              <div class="text-base font-semibold text-surface-900 dark:text-surface-0 leading-normal">
                Playing Verse
              </div>
              <div class="text-xs text-surface-500 dark:text-surface-300 leading-tight">
                Book {{ selectedBookNumber }} Chapter {{ selectedChapter }}:{{ currentVerse?.number }}
              </div>
            </div>
          </div>
          <!-- Play/Pause and Stop buttons in top right corner -->
          <div class="flex gap-2 -mt-1 -mr-1">
            <Button severity="primary" class="w-10 h-10 !p-2" @click="togglePlayPause">
              <component :is="isPlaying ? PauseIcon : PlayIcon" class="w-5 h-5" />
            </Button>
            <Button severity="secondary" class="w-10 h-10 !p-2" @click="stopPlaying(false)" v-tooltip.top="'Stop'">
              <CloseIcon class="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div class="text-sm text-surface-700 dark:text-surface-200 leading-relaxed" v-if="currentVerse?.html"
          v-html="currentVerse.html">
        </div>
        
        <div class="flex flex-col gap-2">
          <div
            class="relative h-1.5 rounded-lg overflow-hidden cursor-pointer hover:h-2 transition-all duration-200 bg-surface-200 dark:bg-surface-700"
            @click="seekToPosition">
            <div class="absolute top-0 left-0 bg-primary h-full rounded-lg transition-all duration-500 ease-in-out"
              :style="{ width: progressPercentage + '%' }" />
          </div>
          <div class="text-right text-xs text-surface-900 dark:text-surface-0 leading-tight">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </div>
        </div>
        
        <!-- Auto-advance settings -->
        <div class="pt-4 mt-2 border-t border-surface-200 dark:border-surface-700">
          <div class="flex items-center gap-2 mb-3">
            <Checkbox v-model="autoAdvanceToNext" inputId="autoAdvance" binary />
            <label for="autoAdvance" class="text-sm text-surface-700 dark:text-surface-200 cursor-pointer">
              Автоматически переходить к следующему стиху
            </label>
          </div>
          
          <div v-if="autoAdvanceToNext" class="flex items-center gap-2">
            <span class="text-sm text-surface-700 dark:text-surface-200">Пауза:</span>
            <InputNumber v-model="autoAdvancePause" :min="0.5" :max="10" :step="0.5" 
              :minFractionDigits="1" :maxFractionDigits="1" 
              class="w-20" size="small" />
            <span class="text-sm text-surface-700 dark:text-surface-200">сек</span>
          </div>
        </div>

        <!-- Verse Correction Interface -->
        <div v-if="showCorrectionInterface"
          class="pt-4 mt-2 border-t border-surface-200 dark:border-surface-700 space-y-3">
          <div class="text-sm font-medium text-surface-900 dark:text-surface-0 mb-3">
            Adjust Verse Timing
          </div>

          <!-- Start Time Controls -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-surface-700 dark:text-surface-200">Start Time:</span>
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-1">
                <!-- Very fast decrease -->
                <Button @click="adjustStartTime(-1.0)" severity="secondary" size="small"
                  class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'-1.0s'">
                  <span class="text-2xl font-bold leading-none" style="margin-top: -2px;">-</span>
                </Button>
                <!-- Fast decrease -->
                <Button @click="adjustStartTime(-0.1)" severity="secondary" size="small"
                  class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'-0.1s'">
                  <span class="text-lg font-bold leading-none" style="margin-top: -1px;">-</span>
                </Button>
                <!-- Fine decrease -->
                <Button @click="adjustStartTime(-0.01)" severity="secondary" size="small"
                  class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'-0.01s'">
                  <span class="text-xs font-bold leading-none">-</span>
                </Button>
                <!-- Time display -->
                <span
                  class="text-sm font-mono min-w-[80px] text-center bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded mx-1">{{
                    formatTimeWithMs(correctionStartTime) }}</span>
                <!-- Fine increase -->
                <Button @click="adjustStartTime(0.01)" severity="secondary" size="small"
                  class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'+0.01s'">
                  <span class="text-xs font-bold leading-none">+</span>
                </Button>
                <!-- Fast increase -->
                <Button @click="adjustStartTime(0.1)" severity="secondary" size="small"
                  class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'+0.1s'">
                  <span class="text-lg font-bold leading-none" style="margin-top: -1px;">+</span>
                </Button>
                <!-- Very fast increase -->
                <Button @click="adjustStartTime(1.0)" severity="secondary" size="small"
                  class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'+1.0s'">
                  <span class="text-2xl font-bold leading-none" style="margin-top: -2px;">+</span>
                </Button>
              </div>
              <!-- Preview button for Start Time -->
              <Button @click="previewStartTime" severity="info" size="small" class="px-2 py-1"
                v-tooltip.top="'Preview start time'">
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
                <Button @click="adjustEndTime(-1.0)" severity="secondary" size="small"
                  class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'-1.0s'">
                  <span class="text-2xl font-bold leading-none" style="margin-top: -2px;">-</span>
                </Button>
                <!-- Fast decrease -->
                <Button @click="adjustEndTime(-0.1)" severity="secondary" size="small"
                  class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'-0.1s'">
                  <span class="text-lg font-bold leading-none" style="margin-top: -1px;">-</span>
                </Button>
                <!-- Fine decrease -->
                <Button @click="adjustEndTime(-0.01)" severity="secondary" size="small"
                  class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'-0.01s'">
                  <span class="text-xs font-bold leading-none">-</span>
                </Button>
                <!-- Time display -->
                <span
                  class="text-sm font-mono min-w-[80px] text-center bg-surface-100 dark:bg-surface-800 px-2 py-1 rounded mx-1">{{
                    formatTimeWithMs(correctionEndTime) }}</span>
                <!-- Fine increase -->
                <Button @click="adjustEndTime(0.01)" severity="secondary" size="small"
                  class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'+0.01s'">
                  <span class="text-xs font-bold leading-none">+</span>
                </Button>
                <!-- Fast increase -->
                <Button @click="adjustEndTime(0.1)" severity="secondary" size="small"
                  class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'+0.1s'">
                  <span class="text-lg font-bold leading-none" style="margin-top: -1px;">+</span>
                </Button>
                <!-- Very fast increase -->
                <Button @click="adjustEndTime(1.0)" severity="secondary" size="small"
                  class="w-7 h-7 !p-0 inline-flex items-center justify-center" v-tooltip.top="'+1.0s'">
                  <span class="text-2xl font-bold leading-none" style="margin-top: -2px;">+</span>
                </Button>
              </div>
              <!-- Preview button for End Time -->
              <Button @click="previewEndTime" severity="info" size="small" class="px-2 py-1"
                v-tooltip.top="'Preview end time'">
                <PlayIcon class="w-3 h-3" />
              </Button>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-2 pt-2">
            <Button @click="applyCorrectionChanges" severity="success" size="small" class="flex-1"
              :disabled="!hasTimingChanges">
              Apply Corrections
            </Button>
            <Button @click="resetCorrectionChanges" severity="secondary" size="small" class="flex-1">
              Reset
            </Button>
            <Button @click="showCorrectionInterface = false" severity="secondary" size="small" class="flex-1">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import Checkbox from 'primevue/checkbox'
import Toast from 'primevue/toast'
import type { ExcerptResponse, ExcerptVerseModel, BookModel } from '../types/api'
import { useTranslations, useBooks, type VoiceWithTranslation } from '../composables/useApi'
import { bibleApiService } from '../services/api'
import { useToast } from 'primevue/usetoast'
// Lucide imports
import {
  RotateCcw as RefreshIcon,
  Info as InfoIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  X as CloseIcon,
  Volume2 as SpeakerIcon
} from 'lucide-vue-next'

// Composables
const { state: voicesState, voices, fetchTranslations } = useTranslations()
const { state: booksState, books, fetchBooks, clearBooks } = useBooks()
const toast = useToast()

// Local state
const selectedVoice = ref<number | null>(null)
const selectedBookNumber = ref<number | null>(null)
const selectedChapter = ref<number | null>(null)

// Track last loaded data to avoid unnecessary reloads
const lastLoadedData = ref<{
  voice: number | null
  book: number | null
  chapter: number | null
}>({
  voice: null,
  book: null,
  chapter: null
})

// Excerpt data state
const excerptState = ref({
  loading: false,
  error: null as string | null
})
const currentExcerpt = ref<ExcerptResponse | null>(null)
const excerptVerses = ref<ExcerptVerseModel[]>([])

// Audio player state
const showPlayer = ref(false)
const isPlaying = ref(false)
const currentVerse = ref<ExcerptVerseModel | null>(null)
const currentPlayingId = ref<number | null>(null)
const audioElement = ref<HTMLAudioElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const progressUpdateInterval = ref<number | null>(null)

// Auto-advance settings
const autoAdvanceToNext = ref(false)
const autoAdvancePause = ref(1) // seconds

// Verse correction state
const showCorrectionInterface = ref(false)
const correctionStartTime = ref(0)
const correctionEndTime = ref(0)
const originalStartTime = ref(0)
const originalEndTime = ref(0)

// Table settings
const defaultPageSize = 15

// Computed properties
const availableVoices = computed(() => {
  if (!voices.value) return []
  
  return voices.value.map(voice => ({
    code: voice.code,
    displayName: `${voice.name} (${voice.translation.name} - ${voice.translation.language})`,
    translationCode: voice.translation.code,
    translationName: voice.translation.name,
    voiceName: voice.name,
    disabled: !voice.active
  }))
})

const bookOptions = computed(() => {
  if (!books.value) return []
  
  return books.value.map(book => ({
    value: book.book_number,
    label: `${book.book_number}. ${book.name}`,
    code: book.code,
    name: book.name
  }))
})

const canLoadData = computed(() => {
  return selectedVoice.value && selectedBookNumber.value && selectedChapter.value
})

const progressPercentage = computed(() => {
  if (!currentVerse.value || duration.value === 0) return 0
  // Calculate progress within the verse bounds
  const verseDuration = currentVerse.value.end - currentVerse.value.begin
  return (currentTime.value / verseDuration) * 100
})

const hasTimingChanges = computed(() => {
  return correctionStartTime.value !== originalStartTime.value ||
    correctionEndTime.value !== originalEndTime.value
})

// Methods
const truncateText = (text: string, maxLength = 30) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

const isVoiceDisabled = (voice: any) => {
  return voice.disabled
}

const getSelectedVoiceDisplayName = (voiceCode: number) => {
  const voice = voices.value.find(v => v.code === voiceCode)
  return voice ? `${voice.name} (${voice.translation.name} - ${voice.translation.language})` : ''
}

const getSelectedBookDisplayName = (bookNumber: number) => {
  const book = bookOptions.value.find(b => b.value === bookNumber)
  return book ? book.label : ''
}

const getVoiceName = (voiceCode: number) => {
  const voice = voices.value.find(v => v.code === voiceCode)
  return voice ? `${voice.name} (${voice.translation.name} - ${voice.translation.language})` : ''
}

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const wholeSecs = Math.floor(seconds % 60)
  const fractionalPart = Math.round((seconds % 1) * 100)
  return `${mins}:${wholeSecs.toString().padStart(2, '0')}.${fractionalPart.toString().padStart(2, '0')}`
}

const formatTimeWithFraction = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const wholeSecs = Math.floor(seconds % 60)
  const fractionalPart = Math.round((seconds % 1) * 100)
  const mainPart = `${mins}:${wholeSecs.toString().padStart(2, '0')}`
  const fractionPart = `.${fractionalPart.toString().padStart(2, '0')}`
  return { mainPart, fractionPart }
}

const formatPauseTime = (seconds: number) => {
  const fractionalPart = Math.round((seconds % 1) * 100)
  const mainPart = seconds.toFixed(0)
  const fractionPart = `.${fractionalPart.toString().padStart(2, '0')}`
  return { mainPart, fractionPart }
}

const formatTimeWithMs = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  const ms = Math.round((seconds % 1) * 1000)
  return `${mins}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(3, '0')}`
}

const getRowClass = (data: ExcerptVerseModel) => {
  return data.start_paragraph ? 'start-paragraph-row' : ''
}

const findNextVerse = (currentVerseCode: number): ExcerptVerseModel | null => {
  if (!excerptVerses.value || excerptVerses.value.length === 0) return null
  
  const currentIndex = excerptVerses.value.findIndex(v => v.code === currentVerseCode)
  if (currentIndex === -1 || currentIndex >= excerptVerses.value.length - 1) return null
  
  return excerptVerses.value[currentIndex + 1]
}

const calculatePauseToNext = (verse: ExcerptVerseModel): number | null => {
  const nextVerse = findNextVerse(verse.code)
  if (!nextVerse) return null
  
  return nextVerse.begin - verse.end
}

// Verse correction functions
const initializeCorrectionInterface = (verse: ExcerptVerseModel) => {
  // Store original values
  originalStartTime.value = verse.begin
  originalEndTime.value = verse.end
  // Set current values
  correctionStartTime.value = verse.begin
  correctionEndTime.value = verse.end
  
  // Set current verse for correction
  currentVerse.value = verse
  
  showCorrectionInterface.value = true
}

const adjustStartTime = (delta: number) => {
  const newValue = correctionStartTime.value + delta
  if (newValue >= 0 && newValue < correctionEndTime.value) {
    correctionStartTime.value = newValue
  }
}

const adjustEndTime = (delta: number) => {
  const newValue = correctionEndTime.value + delta
  if (newValue > correctionStartTime.value) {
    correctionEndTime.value = newValue
  }
}

const resetCorrectionChanges = () => {
  correctionStartTime.value = originalStartTime.value
  correctionEndTime.value = originalEndTime.value
}

const previewStartTime = async () => {
  if (!currentExcerpt.value || !currentVerse.value) return
  
  // Find the part containing this verse
  const part = currentExcerpt.value.parts.find(p => 
    p.verses.some(v => v.code === currentVerse.value!.code)
  )
  if (!part) return

  try {
    // Stop current playback
    if (audioElement.value) {
      audioElement.value.pause()
      audioElement.value = null
    }

    // Create new audio element
    audioElement.value = new Audio(part.audio_link)
    
    audioElement.value.addEventListener('loadedmetadata', () => {
      if (audioElement.value) {
        // Play from corrected start for 2 seconds
        const endTime = Math.min(correctionStartTime.value + 2, correctionEndTime.value)
        audioElement.value.currentTime = correctionStartTime.value
        audioElement.value.play()
        
        // Stop after preview duration
        setTimeout(() => {
          if (audioElement.value) {
            audioElement.value.pause()
          }
        }, (endTime - correctionStartTime.value) * 1000)
      }
    })
  } catch (error) {
    console.error('Error previewing start time:', error)
  }
}

const previewEndTime = async () => {
  if (!currentExcerpt.value || !currentVerse.value) return
  
  // Find the part containing this verse
  const part = currentExcerpt.value.parts.find(p => 
    p.verses.some(v => v.code === currentVerse.value!.code)
  )
  if (!part) return

  try {
    // Stop current playback
    if (audioElement.value) {
      audioElement.value.pause()
      audioElement.value = null
    }

    // Create new audio element
    audioElement.value = new Audio(part.audio_link)
    
    audioElement.value.addEventListener('loadedmetadata', () => {
      if (audioElement.value) {
        // Play 2 seconds before corrected end until end
        const startTime = Math.max(correctionEndTime.value - 2, correctionStartTime.value)
        audioElement.value.currentTime = startTime
        audioElement.value.play()
        
        // Stop at corrected end time
        setTimeout(() => {
          if (audioElement.value) {
            audioElement.value.pause()
          }
        }, (correctionEndTime.value - startTime) * 1000)
      }
    })
  } catch (error) {
    console.error('Error previewing end time:', error)
  }
}

const applyCorrectionChanges = async () => {
  if (!currentVerse.value || !selectedVoice.value || !selectedBookNumber.value || !selectedChapter.value) {
    return
  }

  try {
    const fixData = {
      voice: selectedVoice.value,
      book_number: selectedBookNumber.value,
      chapter_number: selectedChapter.value,
      verse_number: currentVerse.value.number,
      begin: correctionStartTime.value,
      end: correctionEndTime.value,
      info: `Manual timing correction applied via Bible Inspect interface`
    }

    await bibleApiService.createManualFix(fixData)
    
    // Update the verse in local data
    if (currentVerse.value) {
      currentVerse.value.begin = correctionStartTime.value
      currentVerse.value.end = correctionEndTime.value
    }
    
    // Update in excerptVerses array
    const verseIndex = excerptVerses.value.findIndex(v => v.code === currentVerse.value!.code)
    if (verseIndex !== -1) {
      excerptVerses.value[verseIndex].begin = correctionStartTime.value
      excerptVerses.value[verseIndex].end = correctionEndTime.value
    }

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Timing correction applied successfully',
      life: 3000
    })

    showCorrectionInterface.value = false
  } catch (error) {
    console.error('Error applying correction:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to apply timing correction',
      life: 5000
    })
  }
}

// Event handlers
const onVoiceChange = async () => {
  if (selectedVoice.value) {
    const voice = voices.value.find(v => v.code === selectedVoice.value)
    if (voice) {
      await fetchBooks(voice.translation.code)
    }
  } else {
    clearBooks()
  }
  selectedBookNumber.value = null
  selectedChapter.value = null
  excerptVerses.value = []
  // Reset cache
  lastLoadedData.value = { voice: null, book: null, chapter: null }
}

const onBookChange = () => {
  selectedChapter.value = null
  excerptVerses.value = []
  // Reset cache
  lastLoadedData.value = { voice: null, book: null, chapter: null }
}

const onChapterChange = () => {
  if (canLoadData.value) {
    loadExcerptData()
  }
}

const refreshData = () => {
  if (canLoadData.value) {
    // Force reload by resetting cache
    lastLoadedData.value = { voice: null, book: null, chapter: null }
    loadExcerptData()
  }
}

const loadExcerptData = async () => {
  if (!canLoadData.value) return

  // Check if data is already loaded for the same combination
  if (lastLoadedData.value.voice === selectedVoice.value &&
      lastLoadedData.value.book === selectedBookNumber.value &&
      lastLoadedData.value.chapter === selectedChapter.value &&
      excerptVerses.value.length > 0) {
    return // Data already loaded, no need to reload
  }

  const voice = voices.value.find(v => v.code === selectedVoice.value)
  if (!voice) return

  excerptState.value.loading = true
  excerptState.value.error = null

  try {
    const response = await bibleApiService.getChapterWithAlignment({
      translation: voice.translation.code,
      book_number: selectedBookNumber.value!,
      chapter_number: selectedChapter.value!,
      voice: selectedVoice.value!
    })

    currentExcerpt.value = response
    
    // Extract verses from all parts
    excerptVerses.value = response.parts.flatMap(part => part.verses)
    
    // Update last loaded data
    lastLoadedData.value = {
      voice: selectedVoice.value,
      book: selectedBookNumber.value,
      chapter: selectedChapter.value
    }
    
  } catch (error) {
    console.error('Error loading chapter data:', error)
    excerptState.value.error = 'Failed to load chapter data'
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load chapter data',
      life: 5000
    })
  } finally {
    excerptState.value.loading = false
  }
}

// Audio player methods
const playVerse = async (verse: ExcerptVerseModel) => {
  if (!currentExcerpt.value || !selectedVoice.value) return

  // Find the part containing this verse
  const part = currentExcerpt.value.parts.find(p => 
    p.verses.some(v => v.code === verse.code)
  )
  
  if (!part) return

  currentVerse.value = verse
  currentPlayingId.value = verse.code
  showPlayer.value = true

  try {
    // Stop current audio if playing
    if (audioElement.value) {
      audioElement.value.pause()
      audioElement.value = null
    }

    // Create new audio element
    audioElement.value = new Audio(part.audio_link)
    
    audioElement.value.addEventListener('loadedmetadata', () => {
      if (audioElement.value) {
        // Set duration to verse length, not full audio duration
        duration.value = verse.end - verse.begin
        // Set start time to verse begin time
        audioElement.value.currentTime = verse.begin
        // Reset display time to 0 for verse duration
        currentTime.value = 0
      }
    })

    audioElement.value.addEventListener('timeupdate', () => {
      if (audioElement.value) {
        // Calculate current time relative to verse start
        const verseCurrentTime = audioElement.value.currentTime - verse.begin
        currentTime.value = Math.max(0, verseCurrentTime)
        
        // Stop at verse end time
        if (audioElement.value.currentTime >= verse.end) {
          stopPlaying(true) // verse completed
        }
      }
    })

    audioElement.value.addEventListener('ended', () => {
      stopPlaying(true) // verse completed
    })

    audioElement.value.addEventListener('error', (e) => {
      console.error('Audio error:', e)
      toast.add({
        severity: 'error',
        summary: 'Audio Error',
        detail: 'Failed to load audio',
        life: 3000
      })
      stopPlaying(false) // error, not completed
    })

    await audioElement.value.play()
    isPlaying.value = true

  } catch (error) {
    console.error('Error playing verse:', error)
    toast.add({
      severity: 'error',
      summary: 'Playback Error',
      detail: 'Failed to play verse',
      life: 3000
    })
    stopPlaying(false) // error, not completed
  }
}

const togglePlayPause = () => {
  if (!audioElement.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
    isPlaying.value = false
  } else {
    audioElement.value.play()
    isPlaying.value = true
  }
}

const stopPlaying = (verseCompleted = false) => {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value = null
  }
  
  if (progressUpdateInterval.value) {
    clearInterval(progressUpdateInterval.value)
    progressUpdateInterval.value = null
  }
  
  isPlaying.value = false
  
  // If verse completed and auto-advance is enabled, try to play next verse
  if (verseCompleted && autoAdvanceToNext.value && currentVerse.value) {
    const nextVerse = findNextVerse(currentVerse.value.code)
    if (nextVerse) {
      // Wait for the specified pause duration, then play next verse
      setTimeout(() => {
        playVerse(nextVerse)
      }, autoAdvancePause.value * 1000)
      return // Don't close player immediately
    }
  }
  
  // Wait 500ms before closing player (or close immediately if manually stopped)
  const closeDelay = verseCompleted ? 500 : 0
  setTimeout(() => {
    showPlayer.value = false
    currentVerse.value = null
    currentPlayingId.value = null
    currentTime.value = 0
    duration.value = 0
  }, closeDelay)
}

const seekToPosition = (event: MouseEvent) => {
  if (!audioElement.value || !currentVerse.value) return

  const rect = (event.target as HTMLElement).getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const percentage = clickX / rect.width
  
  // Calculate time within verse bounds
  const verseDuration = currentVerse.value.end - currentVerse.value.begin
  const newTime = currentVerse.value.begin + (verseDuration * percentage)
  
  // Set audio to new position
  audioElement.value.currentTime = Math.max(currentVerse.value.begin, Math.min(newTime, currentVerse.value.end))
  
  // Update display time relative to verse start
  const verseCurrentTime = audioElement.value.currentTime - currentVerse.value.begin
  currentTime.value = Math.max(0, verseCurrentTime)
}

// Watcher for chapter changes with debounce
let chapterChangeTimeout: number | null = null

watch(selectedChapter, (newChapter) => {
  if (chapterChangeTimeout) {
    clearTimeout(chapterChangeTimeout)
  }
  
  if (newChapter && canLoadData.value) {
    chapterChangeTimeout = window.setTimeout(() => {
      loadExcerptData()
    }, 500) // 500ms delay
  }
})

// Lifecycle
onMounted(async () => {
  await fetchTranslations()
})

onUnmounted(() => {
  stopPlaying(false) // manual stop
  if (chapterChangeTimeout) {
    clearTimeout(chapterChangeTimeout)
  }
})
</script>

<style scoped>
.compact-table :deep(.p-datatable-tbody > tr > td) {
  padding: 0.5rem;
}

.compact-table :deep(.start-paragraph-row td) {
  padding-top: 3rem !important;
}
</style>
