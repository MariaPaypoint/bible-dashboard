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
                <span :class="{ 'opacity-50': slotProps.option.anomalies_count === 0 }"
                  :title="slotProps.option.displayName">
                  {{ truncateText(slotProps.option.displayName) }}
                </span>
                <Tag :value="slotProps.option.anomalies_count"
                  :severity="slotProps.option.anomalies_count === 0 ? 'secondary' : 'info'" class="ml-2" />
              </div>
            </template>
            <template #value="slotProps">
              <div class="flex items-center justify-between w-full" v-if="slotProps.value">
                <span :title="getSelectedVoiceDisplayName(slotProps.value)">
                  {{ truncateText(getSelectedVoiceDisplayName(slotProps.value)) }}
                </span>
                <Tag :value="getSelectedVoiceAnomaliesCount(slotProps.value)"
                  :severity="getSelectedVoiceAnomaliesCount(slotProps.value) === 0 ? 'secondary' : 'info'"
                  class="ml-2" />
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
                <span :class="{ 'opacity-50': slotProps.option.anomalies_count === 0 }">
                  {{ slotProps.option.label }}
                </span>
                <Tag v-if="selectedVoice" :value="slotProps.option.anomalies_count"
                  :severity="slotProps.option.anomalies_count === 0 ? 'secondary' : 'info'" class="ml-2" />
              </div>
            </template>
            <template #value="slotProps">
              <div class="flex items-center justify-between w-full" v-if="slotProps.value && selectedVoice">
                <span>
                  {{ getSelectedBookDisplayName(slotProps.value) }}
                </span>
                <Tag :value="getSelectedBookAnomaliesCount(slotProps.value)"
                  :severity="getSelectedBookAnomaliesCount(slotProps.value) === 0 ? 'secondary' : 'info'"
                  class="ml-2" />
              </div>
              <span v-else-if="slotProps.value">
                {{ getSelectedBookDisplayName(slotProps.value) }}
              </span>
            </template>
          </Select>
        </div>
        <div class="flex-1 min-w-0" style="flex: 1;">
          <Select id="anomalyTypeFilter" v-model="selectedAnomalyType" :options="anomalyTypeOptions" optionLabel="label"
            optionValue="value" placeholder="All types" class="w-full" :disabled="!selectedVoice"
            @change="onAnomalyTypeChange" showClear />
        </div>
        <Button rounded raised @click="refreshData" :disabled="!selectedVoice" :loading="anomaliesState.loading">
          <RefreshIcon class="w-5 h-5" />
        </Button>
      </div>
    </div>

    <!-- Anomalies Table -->
    <DataTable :value="anomalies" tableStyle="min-width: 50rem" paginator :rows="defaultPageSize"
      :rowsPerPageOptions="[10, 15, 50, 100]" :totalRecords="totalCount" :lazy="true" stripedRows
      :loading="anomaliesState.loading" @page="onPageChange" @sort="onSort" sortMode="single" :rowClass="getRowClass"
      class="compact-table">
      <template #header>
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span v-if="selectedVoice" class="text-sm text-gray-600">
              Voice: {{ getVoiceName(selectedVoice) }}
            </span>
          </div>
        </div>
      </template>

      <Column field="code" header="Code" style="width: 8%"></Column>
      <Column field="book_number" header="Reference" sortable style="width: 20%">
        <template #body="slotProps">
          <span class="text-sm font-medium">{{ formatReference(slotProps.data) }}</span>
        </template>
      </Column>
      <Column field="word" header="Word" style="width: 15%">
        <template #body="slotProps">
          <span class="font-mono font-semibold">{{ slotProps.data.word }}</span>
        </template>
      </Column>
      <Column field="anomaly_type" header="Anomaly Type" sortable style="width: 12%">
        <template #body="slotProps">
          <Tag :value="getAnomalyTypeLabel(slotProps.data.anomaly_type)"
            :severity="getAnomalySeverity(slotProps.data.anomaly_type)" />
        </template>
      </Column>
      <Column header="Information" style="width: 8%">
        <template #body="slotProps">
          <InfoIcon class="w-5 h-5 text-blue-500 cursor-pointer" v-tooltip.top="getInfoTooltip(slotProps.data)" />
        </template>
      </Column>
      <Column field="ratio" header="Ratio" sortable style="width: 10%">
        <template #body="slotProps">
          <Tag :value="slotProps.data.ratio.toFixed(2)" :severity="getRatioSeverity(slotProps.data.ratio)" />
        </template>
      </Column>
      <Column header="Actions" style="width: 10%">
        <template #body="slotProps">
          <div class="flex gap-2 items-center">
            <!-- Dynamic Play/Pause button -->
            <Button v-if="currentPlayingId === slotProps.data.code && isPlaying" severity="primary" class="w-8 h-8"
              v-tooltip.top="'Pause'" @click="togglePlayPause()">
              <PauseIcon class="w-5 h-5 -m-1.5" />
            </Button>
            <Button v-else severity="info" class="w-8 h-8" v-tooltip.top="'Play Verse'"
              @click="playVerse(slotProps.data)" :disabled="isPlaying && currentPlayingId !== slotProps.data.code">
              <PlayIcon class="w-5 h-5 -m-1.5" />
            </Button>
            <Button severity="secondary" class="w-8 h-8" v-tooltip.top="'Correction'">
              <EditIcon class="w-5 h-5 -m-1.5" />
            </Button>
          </div>
        </template>
      </Column>

      <template #footer>
        <div class="flex justify-between items-center">
          <span>Total anomalies: {{ totalCount }} (showing: {{ anomalies ? anomalies.length : 0 }})</span>
          <span v-if="anomaliesState.error" class="text-red-500 text-sm">
            {{ anomaliesState.error }}
          </span>
        </div>
      </template>

      <template #empty>
        <div class="text-center py-8">
          <InfoIcon class="w-12 h-12 text-gray-400 mb-4 mx-auto" />
          <p class="text-gray-600">
            {{ selectedVoice ? 'No anomalies found for selected voice' : 'Select a voice to view anomalies' }}
          </p>
        </div>
      </template>
    </DataTable>

    <!-- Mini Audio Player Popup -->
    <div v-if="showPlayer"
      class="fixed top-4 right-4 z-50 p-7 bg-surface-0 dark:bg-surface-900 rounded-2xl shadow-lg w-96">
      <div class="flex gap-3 w-full">
        <div
          class="flex items-center justify-center h-9 w-9 bg-primary-50 dark:bg-primary-400/30 rounded-lg border border-primary-100 dark:border-primary-400/20">
          <SpeakerIcon class="w-5 h-5 text-primary-600 dark:text-primary-200" />
        </div>
        <div class="flex-1 flex flex-col gap-3">
          <div class="flex items-start justify-between gap-1">
            <div class="flex-1 flex flex-col gap-1">
              <span class="text-lg font-semibold text-surface-900 dark:text-surface-0 leading-normal">
                Playing Verse
              </span>
              <p class="m-0 text-xs text-surface-500 dark:text-surface-300 leading-normal">
                {{ currentVerse?.book_number ? formatReference(currentVerse) : '' }}
              </p>
            </div>
            <Button text severity="secondary" class="w-10 h-10 !p-2 -mt-3 -mr-4" @click="stopPlaying">
              <CloseIcon class="w-5 h-5" />
            </Button>
          </div>
          <div class="text-sm text-surface-700 dark:text-surface-200 leading-relaxed" v-if="currentVerse?.verse_text"
            v-html="highlightProblematicWord(currentVerse.verse_text, currentVerse.word)">
          </div>
          <div class="flex flex-col gap-2">
            <div class="flex h-1.5 rounded-lg overflow-hidden">
              <div class="bg-primary h-full rounded-l-lg transition-all duration-500 ease-in-out"
                :style="{ width: progressPercentage + '%' }" />
              <div
                class="bg-surface-200 dark:bg-surface-700 h-full rounded-r-lg transition-all duration-500 ease-in-out"
                :style="{ width: (100 - progressPercentage) + '%' }" />
            </div>
            <div class="text-right text-xs text-surface-900 dark:text-surface-0 leading-tight">
              {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            </div>
          </div>
          <div class="flex gap-4">
            <Button severity="primary" class="flex-1" @click="togglePlayPause">
              <component :is="isPlaying ? PauseIcon : PlayIcon" class="w-5 h-5 mr-2" />
              <span>{{ isPlaying ? 'Pause' : 'Play' }}</span>
            </Button>
            <Button label="Stop" severity="secondary" @click="stopPlaying" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import type { DataTableSortEvent } from 'primevue/datatable'
import type { VoiceAnomalyModel, BookModel } from '../types/api'
import { useVoiceAnomalies, useTranslations, useBooks, type VoiceWithTranslation } from '../composables/useApi'
// Lucide imports
import {
  RotateCcw as RefreshIcon,
  Info as InfoIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  X as CloseIcon,
  Volume2 as SpeakerIcon
} from 'lucide-vue-next'

// Composables
const {
  state: anomaliesState,
  anomalies,
  totalCount,
  currentPage,
  pageSize,
  selectedVoiceCode,
  selectedAnomalyType,
  selectedBookNumber,
  selectedSortBy,
  selectedSortOrder,
  fetchAnomalies,
  loadPage,
  refreshAnomalies,
  setAnomalyTypeFilter,
  setBookFilter,
  setSortBy
} = useVoiceAnomalies()

const { state: voicesState, voices, fetchTranslations } = useTranslations()
const { state: booksState, books, fetchBooks, clearBooks } = useBooks()

// Local state
const selectedVoice = ref<number | null>(null)

// Audio player state
const showPlayer = ref(false)
const isPlaying = ref(false)
const currentVerse = ref<VoiceAnomalyModel | null>(null)
const currentPlayingId = ref<number | null>(null) // ID of currently playing anomaly
const audioElement = ref<HTMLAudioElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const progressUpdateInterval = ref<number | null>(null)

// Anomaly type filter options
const anomalyTypeOptions = ref([
  { label: 'Fast pronunciation', value: 'fast' },
  { label: 'Slow pronunciation', value: 'slow' },
  { label: 'Unclear pronunciation', value: 'unclear' }
])

// Computed properties
const availableVoices = computed(() => {
  return voices.value.map(voice => ({
    ...voice,
    displayName: `${voice.name} (${voice.translation.name} - ${voice.translation.language})`,
    anomalies_count: voice.anomalies_count || 0
  }))
})

// Function to disable voices with zero anomalies
const isVoiceDisabled = (voice: any) => {
  return voice.anomalies_count === 0
}

// Functions for selected voice display
const getSelectedVoiceDisplayName = (voiceCode: number): string => {
  const voice = voices.value.find(v => v.code === voiceCode)
  return voice ? `${voice.name} (${voice.translation.name} - ${voice.translation.language})` : ''
}

const getSelectedVoiceAnomaliesCount = (voiceCode: number): number => {
  const voice = voices.value.find(v => v.code === voiceCode)
  return voice ? voice.anomalies_count || 0 : 0
}

// Functions for selected book display
const getSelectedBookDisplayName = (bookNumber: number): string => {
  const book = books.value.find(b => b.book_number === bookNumber)
  return book ? `${book.name} (${book.book_number})` : ''
}

const getSelectedBookAnomaliesCount = (bookNumber: number): number => {
  const book = books.value.find(b => b.book_number === bookNumber)
  return book ? book.anomalies_count || 0 : 0
}

const bookOptions = computed(() => {
  return books.value.map((book) => ({
    label: `${book.name} (${book.book_number})`,
    value: book.book_number,
    anomalies_count: book.anomalies_count || 0
  }))
})

// Methods
const onVoiceChange = async () => {
  if (selectedVoice.value) {
    currentPage.value = 1
    selectedAnomalyType.value = null // Reset filters when changing voice
    selectedBookNumber.value = null

    // Get translation code from selected voice
    const selectedVoiceData = availableVoices.value.find(v => v.code === selectedVoice.value)
    if (selectedVoiceData) {
      // Load books for the translation with voice_code to get anomalies count
      await fetchBooks(selectedVoiceData.translation.code, selectedVoice.value)
    }

    await fetchAnomalies(selectedVoice.value, {
      page: 1,
      limit: pageSize.value,
      sort_by: selectedSortBy.value,
      sort_order: selectedSortOrder.value
    })
  } else {
    // Clear books when no voice is selected
    clearBooks()
  }
}

const onAnomalyTypeChange = async () => {
  await setAnomalyTypeFilter(selectedAnomalyType.value)
}

const onBookChange = async () => {
  await setBookFilter(selectedBookNumber.value)
}

const onPageChange = async (event: any) => {
  const newPage = event.page + 1 // PrimeVue uses 0-based indexing
  const newPageSize = event.rows

  // Update page size if it changed
  if (newPageSize !== pageSize.value) {
    pageSize.value = newPageSize
  }

  await loadPage(newPage)
}

const onSort = async (event: DataTableSortEvent) => {
  // Map DataTable field names to API sort_by values
  let sortBy: 'address' | 'type' | 'ratio' = 'ratio'

  if (event.sortField === 'book_number' || event.sortField === 'chapter_number' || event.sortField === 'verse_number') {
    sortBy = 'address'
  } else if (event.sortField === 'anomaly_type') {
    sortBy = 'type'
  } else if (event.sortField === 'ratio') {
    sortBy = 'ratio'
  }

  // Determine sort order from DataTable event
  const sortOrder: 'asc' | 'desc' = event.sortOrder === 1 ? 'asc' : 'desc'

  await setSortBy(sortBy, sortOrder)
}

const refreshData = async () => {
  if (selectedVoice.value) {
    await refreshAnomalies()
  }
}

const getVoiceName = (voiceCode: number): string => {
  const voice = availableVoices.value.find(v => v.code === voiceCode)
  return voice ? voice.displayName : `Voice ${voiceCode}`
}

const getBookName = (bookNumber: number): string => {
  const book = books.value.find((b) => b.book_number === bookNumber)
  return book ? book.name : `Book ${bookNumber}`
}

const formatReference = (anomaly: VoiceAnomalyModel): string => {
  const bookName = getBookName(anomaly.book_number)
  const verse = anomaly.verse_number ? `:${anomaly.verse_number}` : ''
  return `${bookName} (${anomaly.book_number}) ${anomaly.chapter_number}${verse}`
}

const getAnomalyTypeLabel = (type: string): string => {
  switch (type) {
    case 'fast':
      return 'Fast pronunciation'
    case 'slow':
      return 'Slow pronunciation'
    case 'unclear':
      return 'Unclear pronunciation'
    default:
      return type
  }
}

const getAnomalySeverity = (type: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' => {
  switch (type) {
    case 'fast':
      return 'info' // Blue for fast pronunciation (neutral)
    case 'slow':
      return 'secondary' // Gray for slow pronunciation (neutral)
    case 'unclear':
      return 'warn' // Orange for unclear pronunciation (mild concern)
    default:
      return 'secondary'
  }
}

const getRatioClass = (ratio: number): string => {
  if (ratio > 10) {
    return 'text-red-600 font-bold'
  } else if (ratio > 3) {
    return 'text-orange-600 font-semibold'
  }
  return 'text-gray-600'
}

const getRatioSeverity = (ratio: number): string => {
  if (ratio > 10) {
    return 'danger' // Red for values above 10 - high contrast
  } else if (ratio > 3) {
    return 'warn' // Orange for values above 3 up to 10 - medium contrast
  }
  return 'info' // Blue for values up to 3 - better contrast than gray in dark theme
}

const getInfoTooltip = (anomaly: VoiceAnomalyModel): string => {
  const parts = []
  parts.push(`Duration: ${anomaly.duration.toFixed(3)}s`)
  parts.push(`Speed: ${anomaly.speed.toFixed(2)}`)
  if (anomaly.position_in_verse) {
    parts.push(`Position in verse: ${anomaly.position_in_verse}`)
  }
  if (anomaly.position_from_end) {
    parts.push(`Position from end: ${anomaly.position_from_end}`)
  }
  return parts.join('\n')
}

// Function to check if current viewport is mobile
const isMobile = ref(false)

// Function to highlight currently playing row
const getRowClass = (data: VoiceAnomalyModel) => {
  return currentPlayingId.value === data.code ? 'bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500' : ''
}

// Adaptive page size based on screen size
const defaultPageSize = computed(() => isMobile.value ? 10 : 15)

// Audio player computed properties
const progressPercentage = computed(() => {
  if (!duration.value || duration.value === 0) return 0
  return (currentTime.value / duration.value) * 100
})

// Function to truncate text on mobile
const truncateText = (text: string, maxLength: number = 25): string => {
  if (!isMobile.value || !text) return text
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

// Update mobile state on window resize
const updateMobileState = () => {
  isMobile.value = window.innerWidth < 640
}

// Audio player methods
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

const highlightProblematicWord = (verseText: string, problematicWord: string): string => {
  if (!verseText || !problematicWord) return verseText || ''

  // Escape special regex characters
  const escapedWord = problematicWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  // Create a regex to find the problematic word (case-insensitive)
  // Use word boundaries that work better with Cyrillic text
  const regex = new RegExp(`(^|\\s|[^\\p{L}\\p{N}])(${escapedWord})(?=\\s|[^\\p{L}\\p{N}]|$)`, 'giu')

  // Replace the word with highlighted version, preserving the boundary character
  return verseText.replace(regex, (match, boundary, word) => {
    return `${boundary}<span class="text-red-600 font-semibold bg-red-50 dark:bg-red-900/20 px-1 rounded">${word}</span>`
  })
}

const buildAudioUrl = (anomaly: VoiceAnomalyModel): string => {
  // Get translation code from selected voice
  const selectedVoiceData = availableVoices.value.find(v => v.code === anomaly.voice)
  if (!selectedVoiceData) return ''

  const translationAlias = selectedVoiceData.translation.alias || selectedVoiceData.translation.code
  const voiceAlias = selectedVoiceData.alias || selectedVoiceData.code
  const bookNumber = anomaly.book_number.toString().padStart(2, '0')
  const chapterNumber = anomaly.chapter_number.toString().padStart(2, '0')

  return `/api/audio/${translationAlias}/${voiceAlias}/${bookNumber}/${chapterNumber}.mp3`
}

const playVerse = async (anomaly: VoiceAnomalyModel) => {
  try {
    // Stop current playback if any
    if (audioElement.value) {
      audioElement.value.pause()
      audioElement.value = null
    }

    // Clear any existing interval
    if (progressUpdateInterval.value) {
      clearInterval(progressUpdateInterval.value)
      progressUpdateInterval.value = null
    }

    // Set current verse and show player
    currentVerse.value = anomaly
    currentPlayingId.value = anomaly.code
    showPlayer.value = true
    isPlaying.value = true

    // Create audio element
    const audio = new Audio(buildAudioUrl(anomaly))
    audioElement.value = audio

    // Set up audio event listeners
    audio.addEventListener('loadedmetadata', () => {
      // Set current time to verse start and duration to verse length
      audio.currentTime = anomaly.verse_start_time
      currentTime.value = 0 // Reset display time to 0 for verse duration
      duration.value = anomaly.verse_end_time - anomaly.verse_start_time
    })

    audio.addEventListener('timeupdate', () => {
      const verseCurrentTime = audio.currentTime - anomaly.verse_start_time
      currentTime.value = Math.max(0, verseCurrentTime)

      // Stop when reaching verse end
      if (audio.currentTime >= anomaly.verse_end_time) {
        stopPlaying()
      }
    })

    audio.addEventListener('ended', () => {
      stopPlaying()
    })

    audio.addEventListener('error', (e) => {
      console.error('Audio playback error:', e)
      stopPlaying()
    })

    // Start playback
    await audio.play()

    // Update progress every 100ms
    progressUpdateInterval.value = setInterval(() => {
      if (audio.currentTime >= anomaly.verse_end_time) {
        stopPlaying()
      }
    }, 100)

  } catch (error) {
    console.error('Error playing verse:', error)
    stopPlaying()
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

const stopPlaying = () => {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value = null
  }

  if (progressUpdateInterval.value) {
    clearInterval(progressUpdateInterval.value)
    progressUpdateInterval.value = null
  }

  showPlayer.value = false
  isPlaying.value = false
  currentVerse.value = null
  currentPlayingId.value = null
  currentTime.value = 0
  duration.value = 0
}

// Initialize data on mount
onMounted(async () => {
  if (voices.value.length === 0) {
    await fetchTranslations()
  }

  // Initialize mobile state
  updateMobileState()
  window.addEventListener('resize', updateMobileState)
})

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('resize', updateMobileState)

  // Clean up audio resources
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value = null
  }

  if (progressUpdateInterval.value) {
    clearInterval(progressUpdateInterval.value)
    progressUpdateInterval.value = null
  }
})

</script>

<style scoped>
/* Compact table styles - reduce vertical padding in rows */
.compact-table :deep(.p-datatable-tbody > tr > td) {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.compact-table :deep(.p-datatable-thead > tr > th) {
  padding-top: 0.75rem;
  padding-bottom: 0.75rem;
}
</style>
