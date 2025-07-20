<template>
    <div class="w-full">
        <!-- Voice Selection and Filters -->
        <div class="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-surface-800 dark:border-surface-700">
            <div class="flex items-center gap-3">
                <div class="flex-1 min-w-0" style="flex: 2;">
                    <label for="voiceSelect" class="block text-sm font-medium mb-1">Select voice to view anomalies:</label>
                    <Select 
                        id="voiceSelect"
                        v-model="selectedVoice" 
                        :options="availableVoices" 
                        optionLabel="displayName"
                        optionValue="code"
                        :optionDisabled="isVoiceDisabled"
                        placeholder="Select voice"
                        class="w-full"
                        @change="onVoiceChange"
                    >
                        <template #option="slotProps">
                            <div class="flex items-center justify-between w-full">
                                <span :class="{ 'opacity-50': slotProps.option.anomalies_count === 0 }">
                                    {{ slotProps.option.displayName }}
                                </span>
                                <Tag 
                                    :value="slotProps.option.anomalies_count" 
                                    :severity="slotProps.option.anomalies_count === 0 ? 'secondary' : 'info'"
                                    class="ml-2"
                                />
                            </div>
                        </template>
                        <template #value="slotProps">
                            <div class="flex items-center justify-between w-full" v-if="slotProps.value">
                                <span>
                                    {{ getSelectedVoiceDisplayName(slotProps.value) }}
                                </span>
                                <Tag 
                                    :value="getSelectedVoiceAnomaliesCount(slotProps.value)" 
                                    :severity="getSelectedVoiceAnomaliesCount(slotProps.value) === 0 ? 'secondary' : 'info'"
                                    class="ml-2"
                                />
                            </div>
                        </template>
                    </Select>
                </div>
                <div class="flex-1 min-w-0" style="flex: 1;">
                    <label for="bookFilter" class="block text-sm font-medium mb-1">Filter by book:</label>
                    <Select 
                        id="bookFilter"
                        v-model="selectedBookNumber" 
                        :options="bookOptions" 
                        optionLabel="label"
                        optionValue="value"
                        placeholder="All books"
                        class="w-full"
                        :disabled="!selectedVoice"
                        :loading="booksState.loading"
                        @change="onBookChange"
                        showClear
                    >
                        <template #option="slotProps">
                            <div class="flex items-center justify-between w-full">
                                <span :class="{ 'opacity-50': slotProps.option.anomalies_count === 0 }">
                                    {{ slotProps.option.label }}
                                </span>
                                <Tag 
                                    v-if="selectedVoice"
                                    :value="slotProps.option.anomalies_count" 
                                    :severity="slotProps.option.anomalies_count === 0 ? 'secondary' : 'info'"
                                    class="ml-2"
                                />
                            </div>
                        </template>
                        <template #value="slotProps">
                            <div class="flex items-center justify-between w-full" v-if="slotProps.value && selectedVoice">
                                <span>
                                    {{ getSelectedBookDisplayName(slotProps.value) }}
                                </span>
                                <Tag 
                                    :value="getSelectedBookAnomaliesCount(slotProps.value)" 
                                    :severity="getSelectedBookAnomaliesCount(slotProps.value) === 0 ? 'secondary' : 'info'"
                                    class="ml-2"
                                />
                            </div>
                            <span v-else-if="slotProps.value">
                                {{ getSelectedBookDisplayName(slotProps.value) }}
                            </span>
                        </template>
                    </Select>
                </div>
                <div class="flex-1 min-w-0" style="flex: 1;">
                    <label for="anomalyTypeFilter" class="block text-sm font-medium mb-1">Filter by anomaly type:</label>
                    <Select 
                        id="anomalyTypeFilter"
                        v-model="selectedAnomalyType" 
                        :options="anomalyTypeOptions" 
                        optionLabel="label"
                        optionValue="value"
                        placeholder="All types"
                        class="w-full"
                        :disabled="!selectedVoice"
                        @change="onAnomalyTypeChange"
                        showClear
                    />
                </div>
                <Button 
                    icon="pi pi-refresh" 
                    rounded 
                    raised 
                    @click="refreshData"
                    :disabled="!selectedVoice"
                    :loading="anomaliesState.loading"
                />
            </div>
        </div>

        <!-- Anomalies Table -->
        <DataTable 
            :value="anomalies" 
            tableStyle="min-width: 50rem" 
            paginator 
            :rows="pageSize" 
            :rowsPerPageOptions="[10, 25, 50, 100]"
            :totalRecords="totalCount"
            :lazy="true"
            stripedRows
            :loading="anomaliesState.loading"
            @page="onPageChange"
            @sort="onSort"
            sortMode="single"
        >
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xl font-bold">Voice Anomalies</span>
                    <div class="flex items-center gap-2">
                        <span v-if="selectedVoice" class="text-sm text-gray-600">
                            Voice: {{ getVoiceName(selectedVoice) }}
                        </span>
                    </div>
                </div>
            </template>
            
            <Column field="code" header="Code" sortable style="width: 8%"></Column>
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
                    <i class="pi pi-info-circle text-blue-500 cursor-pointer" 
                       v-tooltip.top="getInfoTooltip(slotProps.data)"
                       style="font-size: 1.2rem;"></i>
                </template>
            </Column>
            <Column field="ratio" header="Ratio" sortable style="width: 10%">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.ratio.toFixed(2)" 
                         :severity="getRatioSeverity(slotProps.data.ratio)" />
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
                    <i class="pi pi-info-circle text-4xl text-gray-400 mb-4"></i>
                    <p class="text-gray-600">
                        {{ selectedVoice ? 'No anomalies found for selected voice' : 'Select a voice to view anomalies' }}
                    </p>
                </div>
            </template>
        </DataTable>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import type { DataTableSortEvent } from 'primevue/datatable'
import type { VoiceAnomalyModel, BookModel } from '../types/api'
import { useVoiceAnomalies, useTranslations, useBooks, type VoiceWithTranslation } from '../composables/useApi'

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

// Initialize data on mount
onMounted(async () => {
  if (voices.value.length === 0) {
    await fetchTranslations()
  }
})
</script>
