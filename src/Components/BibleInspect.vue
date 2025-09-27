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
      <Column field="html" header="Text" style="width: 50%">
        <template #body="slotProps">
          <div class="text-sm" v-html="slotProps.data.html"></div>
        </template>
      </Column>
      <Column field="begin" header="Start" style="width: 12%">
        <template #body="slotProps">
          <span class="text-sm font-mono">
            {{ formatTimeWithFraction(slotProps.data.begin).mainPart }}<span class="opacity-50">{{ formatTimeWithFraction(slotProps.data.begin).fractionPart }}</span>
          </span>
        </template>
      </Column>
      <Column field="end" header="End" style="width: 12%">
        <template #body="slotProps">
          <span class="text-sm font-mono">
            {{ formatTimeWithFraction(slotProps.data.end).mainPart }}<span class="opacity-50">{{ formatTimeWithFraction(slotProps.data.end).fractionPart }}</span>
          </span>
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

const getRowClass = (data: ExcerptVerseModel) => {
  return data.start_paragraph ? 'start-paragraph-row' : ''
}

const findNextVerse = (currentVerseCode: number): ExcerptVerseModel | null => {
  if (!excerptVerses.value || excerptVerses.value.length === 0) return null
  
  const currentIndex = excerptVerses.value.findIndex(v => v.code === currentVerseCode)
  if (currentIndex === -1 || currentIndex >= excerptVerses.value.length - 1) return null
  
  return excerptVerses.value[currentIndex + 1]
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
