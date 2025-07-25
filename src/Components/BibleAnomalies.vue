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
        <div class="flex-1 min-w-0" style="flex: 1;">
          <Select id="statusFilter" v-model="selectedStatus" :options="statusOptions" optionLabel="label"
            optionValue="value" placeholder="All statuses" class="w-full" :disabled="!selectedVoice"
            @change="onStatusChange" showClear />
        </div>
        <Button @click="refreshData" :disabled="!selectedVoice" :loading="anomaliesState.loading">
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
          <span class="font-mono font-semibold">{{ slotProps.data.word || '—' }}</span>
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
      <Column field="status" header="Status" style="width: 12%">
        <template #body="slotProps">
          <Button type="button" 
            :severity="getStatusSeverity(slotProps.data.status)" 
            @click="(event: Event) => toggleStatusPopover(event, slotProps.data.code)" 
            class="min-w-44 text-xs flex items-center justify-between" size="small">
            <span>{{ getStatusLabel(slotProps.data.status) }}</span>
            <ChevronDownIcon class="w-4 h-4 ml-2" />
          </Button>
          
          <Popover :ref="(el) => setStatusPopoverRef(el, slotProps.data.code)">
            <div class="flex flex-col gap-2 p-0">
              <ul class="list-none p-0 m-0 flex flex-col gap-1">
                <li v-for="option in statusOptions" :key="option.value" 
                  :class="[
                    'flex flex-col gap-1 px-3 py-2 hover:bg-emphasis cursor-pointer rounded-border',
                    { 'bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-700': option.value === slotProps.data.status }
                  ]" 
                  @click="selectStatus(slotProps.data, option.value)">
                  <div class="flex items-center gap-2">
                    <Tag :value="option.label" :severity="getStatusSeverity(option.value)" class="text-xs" />
                  </div>
                  <span class="text-xs text-muted-color ml-1">{{ option.description }}</span>
                </li>
              </ul>
            </div>
          </Popover>
        </template>
      </Column>
      <Column header="Actions" style="width: 10%">
        <template #body="slotProps">
          <div class="flex gap-1">
            <!-- Dynamic Play/Pause button -->
            <Button v-if="currentPlayingId === slotProps.data.code && isPlaying" severity="primary" class="w-8 h-8"
              v-tooltip.top="'Pause'" @click="togglePlayPause()">
              <PauseIcon class="w-5 h-5 -m-1.5" />
            </Button>
            <Button v-else severity="info" class="w-8 h-8" v-tooltip.top="'Play Verse'"
              @click="playVerse(slotProps.data)" :disabled="isPlaying && currentPlayingId !== slotProps.data.code">
              <PlayIcon class="w-5 h-5 -m-1.5" />
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
                Book {{ currentVerse?.book_number }} Chapter {{ currentVerse?.chapter_number }}:{{ currentVerse?.verse_number }}
              </div>
            </div>
          </div>
          <!-- Play/Pause and Stop buttons in top right corner -->
          <div class="flex gap-2 -mt-1 -mr-1">
            <Button severity="primary" class="w-10 h-10 !p-2" @click="togglePlayPause">
              <component :is="isPlaying ? PauseIcon : PlayIcon" class="w-5 h-5" />
            </Button>
            <Button severity="secondary" class="w-10 h-10 !p-2" @click="stopPlaying" v-tooltip.top="'Stop'">
              <CloseIcon class="w-5 h-5" />
            </Button>
          </div>
        </div>
        <div class="text-sm text-surface-700 dark:text-surface-200 leading-relaxed" v-if="currentVerse?.verse_text"
          v-html="highlightProblematicWord(currentVerse.verse_text, currentVerse.word, currentVerse.position_in_verse, currentVerse.position_from_end)">
        </div>
        <div class="flex flex-col gap-2">
          <div class="relative h-1.5 rounded-lg overflow-hidden cursor-pointer hover:h-2 transition-all duration-200 bg-surface-200 dark:bg-surface-700"
               @click="seekToPosition">
            <div class="absolute top-0 left-0 bg-primary h-full rounded-lg transition-all duration-500 ease-in-out"
              :style="{ width: progressPercentage + '%' }" />
          </div>
          <div class="text-right text-xs text-surface-900 dark:text-surface-0 leading-tight">
            {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
          </div>
        </div>
        <!-- Main action buttons -->
        <div class="flex gap-4">
          <Button 
            severity="danger" 
            :class="['flex-1', { 'animate-pulse-glow': showButtonAnimation }]" 
            @click="confirmAnomaly" 
            :disabled="!currentVerse">
            <span class="font-semibold text-sm">Confirm Error</span>
          </Button>
          <Button 
            severity="success" 
            :class="['flex-1', { 'animate-pulse-glow': showButtonAnimation }]" 
            @click="disproveAnomaly" 
            :disabled="!currentVerse">
            <span class="font-semibold text-sm">Alignment Correct</span>
          </Button>
        </div>
        <!-- Auto-advance checkbox -->
        <div class="flex items-center gap-2 pt-4 mt-2 border-t border-surface-200 dark:border-surface-700">
          <Checkbox v-model="autoAdvanceToNext" inputId="autoAdvance" binary />
          <label for="autoAdvance" class="text-sm text-surface-700 dark:text-surface-200 cursor-pointer">
            Automatically advance to next verse
          </label>
        </div>
      </div>
    </div>

    <!-- Toast notifications -->
    <Toast />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import Toast from 'primevue/toast'
import Popover from 'primevue/popover'
import Checkbox from 'primevue/checkbox'
import type { DataTableSortEvent } from 'primevue/datatable'
import type { VoiceAnomalyModel, BookModel, AnomalyStatus, AnomalyType } from '../types/api'
import { useVoiceAnomalies, useTranslations, useBooks, type VoiceWithTranslation } from '../composables/useApi'
import { apiService } from '../services/api'
import { useToast } from 'primevue/usetoast'
// Lucide imports
import {
  RotateCcw as RefreshIcon,
  Info as InfoIcon,
  Play as PlayIcon,
  Pause as PauseIcon,
  Edit as EditIcon,
  X as CloseIcon,
  Volume2 as SpeakerIcon,
  ChevronDown as ChevronDownIcon
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
  selectedStatus,
  selectedSortBy,
  selectedSortOrder,
  fetchAnomalies,
  loadPage,
  refreshAnomalies,
  setAnomalyTypeFilter,
  setBookFilter,
  setStatusFilter,
  setSortBy,
  updateAnomalyStatus
} = useVoiceAnomalies()

const { state: voicesState, voices, fetchTranslations } = useTranslations()
const { state: booksState, books, fetchBooks, clearBooks } = useBooks()
const toast = useToast()

// Local state
const selectedVoice = ref<number | null>(null)

// Audio player state
const showPlayer = ref(false)
const isPlaying = ref(false)
const currentVerse = ref<VoiceAnomalyModel | null>(null)
const currentPlayingId = ref<number | null>(null)
const showButtonAnimation = ref(false) // ID of currently playing anomaly
const audioElement = ref<HTMLAudioElement | null>(null)
const currentTime = ref(0)
const duration = ref(0)
const progressUpdateInterval = ref<number | null>(null)
const autoAdvanceToNext = ref(false) // Auto-advance to next verse checkbox

// Anomaly type filter options
const anomalyTypeOptions = ref([
  { label: 'Fast first word', value: 'fast_first' },
  { label: 'Fast last word', value: 'fast_last' },
  { label: 'Fast middle word', value: 'fast_middle' },
  { label: 'Fast previous verse', value: 'fast_previous_verse' }
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

// Status options
const statusOptions = [
  { label: 'Detected', value: 'detected' as AnomalyStatus, description: 'Error detected automatically (default)' },
  { label: 'Confirmed', value: 'confirmed' as AnomalyStatus, description: 'Error confirmed during verification' },
  { label: 'Disproved', value: 'disproved' as AnomalyStatus, description: 'Error disproved, not confirmed by verification' },
  { label: 'Corrected', value: 'corrected' as AnomalyStatus, description: 'Manual correction performed' }
]

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

const onStatusChange = async () => {
  await setStatusFilter(selectedStatus.value)
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
  return `${bookName} (${anomaly.book_number}) ${anomaly.chapter_number}:${anomaly.verse_number}`
}

const getAnomalyTypeLabel = (type: AnomalyType): string => {
  switch (type) {
    case 'fast_first':
      return 'Fast first word'
    case 'fast_last':
      return 'Fast last word'
    case 'fast_middle':
      return 'Fast middle word'
    case 'fast_previous_verse':
      return 'Fast previous verse'
    default:
      return type
  }
}

const getAnomalySeverity = (type: AnomalyType): 'success' | 'info' | 'warn' | 'danger' | 'secondary' => {
  switch (type) {
    case 'fast_first':
      return 'danger' // Red for fast first word (high priority)
    case 'fast_last':
      return 'warn' // Orange for fast last word (medium priority)
    case 'fast_middle':
      return 'info' // Blue for fast middle word (low priority)
    case 'fast_previous_verse':
      return 'secondary' // Gray for fast previous verse (neutral)
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
  if (anomaly.duration !== null) {
    parts.push(`Duration: ${anomaly.duration.toFixed(3)}s`)
  }
  if (anomaly.speed !== null) {
    parts.push(`Speed: ${anomaly.speed.toFixed(2)}`)
  }
  if (anomaly.position_in_verse) {
    parts.push(`Position in verse: ${anomaly.position_in_verse}`)
  }
  if (anomaly.position_from_end) {
    parts.push(`Position from end: ${anomaly.position_from_end}`)
  }
  return parts.join('\n')
}

// Status display functions
const getStatusLabel = (status: AnomalyStatus): string => {
  const statusMap = {
    'detected': 'Detected',
    'confirmed': 'Confirmed',
    'disproved': 'Disproved',
    'corrected': 'Corrected'
  }
  return statusMap[status] || status
}

const getStatusSeverity = (status: AnomalyStatus): 'success' | 'info' | 'warn' | 'danger' | 'secondary' => {
  const severityMap = {
    'detected': 'warn' as const,     // желтый
    'confirmed': 'danger' as const,  // красный
    'disproved': 'success' as const, // зеленый
    'corrected': 'success' as const  // зеленый
  }
  return severityMap[status] || 'secondary'
}

// Function to handle status change
const handleStatusChange = async (anomaly: VoiceAnomalyModel, newStatus: AnomalyStatus, showToast: boolean = true) => {
  try {
    // Direct API call without global loading state
    const result = await apiService.updateAnomalyStatus(anomaly.code, newStatus)
    if (result) {
      // Update the anomaly in the local list
      const index = anomalies.value.findIndex(a => a.code === anomaly.code)
      if (index !== -1) {
        anomalies.value[index] = result
      }
      if (showToast) {
        toast.add({
          severity: 'success',
          summary: 'Status Updated',
          detail: `Anomaly status changed to ${getStatusLabel(newStatus)}`,
          life: 3000
        })
      }
    }
  } catch (error) {
    console.error('Error updating anomaly status:', error)
    if (showToast) {
      toast.add({
        severity: 'error',
        summary: 'Update Failed',
        detail: 'Failed to update anomaly status. Please try again.',
        life: 5000
      })
    }
  }
}

// Function to check if current viewport is mobile
const isMobile = ref(false)

// Status popover management
const statusPopovers = ref<Map<number, any>>(new Map())

const setStatusPopoverRef = (el: any, anomalyCode: number) => {
  if (el) {
    statusPopovers.value.set(anomalyCode, el)
  }
}

const toggleStatusPopover = (event: Event, anomalyCode: number) => {
  const popover = statusPopovers.value.get(anomalyCode)
  if (popover) {
    popover.toggle(event)
  }
}

const selectStatus = async (anomaly: VoiceAnomalyModel, newStatus: AnomalyStatus) => {
  // Close the popover
  const popover = statusPopovers.value.get(anomaly.code)
  if (popover) {
    popover.hide()
  }
  
  // Update the status
  await handleStatusChange(anomaly, newStatus)
}

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

const highlightProblematicWord = (verseText: string, problematicWord: string | null, positionInVerse: number | null, positionFromEnd: number | null): string => {
  if (!verseText || !problematicWord) return verseText || ''

  // If no position data is available, we can't accurately highlight
  if (positionInVerse === null && positionFromEnd === null) return verseText
  
  // Escape special regex characters
  const escapedWord = problematicWord.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  
  // Split the verse text into words
  // We'll use a regex that matches words and non-words to preserve everything
  const parts = verseText.split(/([\p{L}\p{N}]+)/u).filter(p => p !== '')
  
  // Find the correct word index using position information
  let targetIndex = -1
  
  if (positionInVerse !== null) {
    // Position is 1-indexed in the API
    targetIndex = positionInVerse - 1
  } else if (positionFromEnd !== null && parts.length > 0) {
    // Calculate from the end if position_from_end is available
    // Count only actual words (not spaces/punctuation)
    const wordCount = parts.filter(p => /[\p{L}\p{N}]/u.test(p)).length
    targetIndex = wordCount - positionFromEnd
  }
  
  // If we couldn't determine a valid index, return the original text
  if (targetIndex < 0) return verseText
  
  // Count actual words until we reach our target
  let wordIndex = -1
  let resultText = ''
  
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i]
    
    // If this is a word (not punctuation or space)
    if (/[\p{L}\p{N}]/u.test(part)) {
      wordIndex++
      
      // If this is our target word
      if (wordIndex === targetIndex && part.toLowerCase() === problematicWord.toLowerCase()) {
        resultText += `<span class="text-red-600 font-semibold bg-red-50 dark:bg-red-900/20 px-1 rounded">${part}</span>`
      } else {
        resultText += part
      }
    } else {
      // Add non-word parts as is
      resultText += part
    }
  }
  
  return resultText
}

const buildAudioUrl = (anomaly: VoiceAnomalyModel): string => {
  // Get translation code from selected voice
  const selectedVoiceData = availableVoices.value.find(v => v.code === anomaly.voice)
  
  if (!selectedVoiceData) {
    console.error('Voice not found for code:', anomaly.voice)
    return ''
  }

  const translationAlias = selectedVoiceData.translation.alias || selectedVoiceData.translation.code
  const voiceAlias = selectedVoiceData.alias || selectedVoiceData.code
  const bookNumber = anomaly.book_number.toString().padStart(2, '0')
  const chapterNumber = anomaly.chapter_number.toString().padStart(2, '0')

  return `/api/audio/${translationAlias}/${voiceAlias}/${bookNumber}/${chapterNumber}.mp3`
}

const playVerse = async (anomaly: VoiceAnomalyModel) => {
  let errorHandled = false // Flag to prevent duplicate error messages
  
  try {
    // Check if verse positions are available
    if (anomaly.verse_start_time === null || anomaly.verse_end_time === null) {
      toast.add({
        severity: 'error',
        summary: 'Audio Error',
        detail: 'Verse timing information is not available for this anomaly. Cannot play specific verse segment.',
        life: 5000
      })
      return
    }
    
    // Ensure translations are loaded
    if (voices.value.length === 0) {
      await fetchTranslations()
    }
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

    // Set current verse but DON'T show player yet
    currentVerse.value = anomaly
    currentPlayingId.value = anomaly.code
    // showPlayer.value = true // Move this to after successful load
    isPlaying.value = false // Set to false initially

    // Create audio element
    const audioUrl = buildAudioUrl(anomaly)
    if (!audioUrl) {
      console.error('Failed to build audio URL')
      toast.add({
        severity: 'error',
        summary: 'Audio Error',
        detail: 'Unable to build audio URL. Voice data may not be loaded.',
        life: 5000
      })
      return
    }
    

    const audio = new Audio(audioUrl)
    audioElement.value = audio

    // Add load error handler
    audio.addEventListener('loadstart', () => {
      // Audio loading started
    })

    // Set up audio event listeners
    audio.addEventListener('loadedmetadata', () => {
      // Set current time to verse start and duration to verse length
      // (positions are guaranteed to be non-null at this point)
      audio.currentTime = anomaly.verse_start_time!
      currentTime.value = 0 // Reset display time to 0 for verse duration
      duration.value = anomaly.verse_end_time! - anomaly.verse_start_time!
      
      // NOW show the player since audio loaded successfully
      showPlayer.value = true
      isPlaying.value = true
    })

    audio.addEventListener('timeupdate', () => {
      // Playing specific verse segment (positions are guaranteed to be non-null)
      const verseCurrentTime = audio.currentTime - anomaly.verse_start_time!
      currentTime.value = Math.max(0, verseCurrentTime)

      // Stop when reaching verse end
      if (audio.currentTime >= anomaly.verse_end_time!) {
        onAudioComplete()
      }
    })

    audio.addEventListener('ended', () => {
      onAudioComplete()
    })

    audio.addEventListener('error', (e) => {
      if (errorHandled) return // Prevent duplicate error messages
      errorHandled = true
      
      console.error('Audio playback error:', e)
      let errorMessage = 'Failed to load audio file. Please try again.'
      
      // More specific error messages based on error type
      const audioElement = e.target as HTMLAudioElement
      if (audioElement && audioElement.error) {
        switch (audioElement.error.code) {
          case audioElement.error.MEDIA_ERR_ABORTED:
            errorMessage = 'Audio playback was aborted.'
            break
          case audioElement.error.MEDIA_ERR_NETWORK:
            errorMessage = 'Network error occurred while loading audio.'
            break
          case audioElement.error.MEDIA_ERR_DECODE:
            errorMessage = 'Audio file is corrupted or in unsupported format.'
            break
          case audioElement.error.MEDIA_ERR_SRC_NOT_SUPPORTED:
            errorMessage = 'Audio file not found or format not supported.'
            break
          default:
            errorMessage = 'Unknown audio error occurred.'
        }
      }
      
      toast.add({
        severity: 'error',
        summary: 'Audio Error',
        detail: errorMessage,
        life: 5000
      })
      stopPlaying()
    })

    // Start playback
    try {
      await audio.play()
    } catch (playError) {
      if (errorHandled) return // Prevent duplicate error messages
      errorHandled = true
      
      console.error('Error starting audio playback:', playError)
      toast.add({
        severity: 'error',
        summary: 'Playback Error',
        detail: 'Unable to start audio playback. Please click the play button to try again.',
        life: 5000
      })
      stopPlaying()
      return
    }

    // Progress is updated by timeupdate event, no need for interval

  } catch (error) {
    if (errorHandled) return // Prevent duplicate error messages
    errorHandled = true
    
    console.error('Error playing verse:', error)
    toast.add({
      severity: 'error',
      summary: 'Playback Error',
      detail: 'Unable to play verse audio. Please check your connection and try again.',
      life: 5000
    })
    stopPlaying()
  }
}

const togglePlayPause = () => {
  // If audio completed and no audio element, restart playback from beginning
  if (!audioElement.value && currentVerse.value) {
    showButtonAnimation.value = false
    // Reset timeline before restarting
    currentTime.value = 0
    playVerse(currentVerse.value)
    return
  }

  if (!audioElement.value) return

  if (isPlaying.value) {
    audioElement.value.pause()
    isPlaying.value = false
  } else {
    audioElement.value.play()
    isPlaying.value = true
  }
}

// Function to seek to position when clicking on timeline
const seekToPosition = (event: MouseEvent) => {
  if (!audioElement.value || !currentVerse.value || duration.value <= 0) return
  
  const progressBar = event.currentTarget as HTMLElement
  const rect = progressBar.getBoundingClientRect()
  const clickX = event.clientX - rect.left
  const progressBarWidth = rect.width
  
  // Calculate the percentage of where the user clicked
  const clickPercentage = Math.max(0, Math.min(1, clickX / progressBarWidth))
  
  // Calculate the new time position
  const newTime = clickPercentage * duration.value
  
  // For verse segments, we need to add the verse start time
  if (currentVerse.value.verse_start_time !== null && currentVerse.value.verse_end_time !== null) {
    const verseStartTime = currentVerse.value.verse_start_time
    const actualNewTime = verseStartTime + newTime
    
    // Make sure we don't go beyond the verse end time
    const maxTime = currentVerse.value.verse_end_time
    audioElement.value.currentTime = Math.min(actualNewTime, maxTime)
  } else {
    // For full chapter playback
    audioElement.value.currentTime = newTime
  }
  
  // Update the current time display immediately
  currentTime.value = newTime
}

// Function to handle audio completion without closing player
const onAudioComplete = () => {
  if (audioElement.value) {
    audioElement.value.pause()
    audioElement.value = null
  }

  isPlaying.value = false
  // Set currentTime to duration to ensure 100% progress
  if (duration.value > 0) {
    currentTime.value = duration.value
  }
  
  // Start button animation to prompt user action
  showButtonAnimation.value = true
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
  showButtonAnimation.value = false
}

// Function to find next anomaly in the list
const findNextAnomaly = (): VoiceAnomalyModel | null => {
  if (!currentVerse.value || !anomalies.value.length) {
    return null
  }
  
  const currentIndex = anomalies.value.findIndex(anomaly => anomaly.code === currentVerse.value!.code)
  if (currentIndex >= 0 && currentIndex < anomalies.value.length - 1) {
    return anomalies.value[currentIndex + 1]
  }
  
  return null
}

// Function to advance to next verse if auto-advance is enabled
const advanceToNextVerse = async () => {
  if (autoAdvanceToNext.value) {
    const nextAnomaly = findNextAnomaly()
    if (nextAnomaly) {
      // Small delay to show the status change before advancing
      setTimeout(() => {
        playVerse(nextAnomaly)
      }, 500)
    } else {
      // No more anomalies, just stop playing
      stopPlaying()
    }
  } else {
    stopPlaying()
  }
}

// Functions for anomaly status change from mini-player
const confirmAnomaly = async () => {
  if (currentVerse.value) {
    showButtonAnimation.value = false
    await handleStatusChange(currentVerse.value, 'confirmed', !autoAdvanceToNext.value)
    await advanceToNextVerse()
  }
}

const disproveAnomaly = async () => {
  if (currentVerse.value) {
    showButtonAnimation.value = false
    await handleStatusChange(currentVerse.value, 'disproved', !autoAdvanceToNext.value)
    await advanceToNextVerse()
  }
}

// Keyboard event handler
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && showPlayer.value) {
    stopPlaying()
  }
}

// Initialize data on mount
onMounted(async () => {
  if (voices.value.length === 0) {
    await fetchTranslations()
  }

  // Initialize mobile state
  updateMobileState()
  window.addEventListener('resize', updateMobileState)
  
  // Set up keyboard event listener
  window.addEventListener('keydown', handleKeydown)
})

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('resize', updateMobileState)
  window.removeEventListener('keydown', handleKeydown)

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

/* Animation 1: Pulse effect */
@keyframes pulse-glow {
  0%, 100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(var(--primary-500), 0.4);
  }
  50% {
    transform: scale(1.05);
    box-shadow: 0 0 0 10px rgba(var(--primary-500), 0);
  }
}

.animate-pulse-glow {
  animation: pulse-glow 1.5s ease-in-out infinite;
}
</style>
