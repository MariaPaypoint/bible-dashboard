import { ref, reactive, computed } from 'vue'
import { apiService } from '../services/api'
import type { TranslationModel, LanguageModel, BookModel, TranslationListParams, VoiceModel, VoiceAnomalyModel, VoiceAnomalyListParams } from '../types/api'

// Extended voice model with translation info
export interface VoiceWithTranslation extends VoiceModel {
  translation: {
    code: number
    alias: string
    name: string
    description: string | null
    language: string
    active: boolean
  }
}

export interface ApiState {
  loading: boolean
  error: string | null
}

export function useApi() {
  const state = reactive<ApiState>({
    loading: false,
    error: null
  })

  const handleApiCall = async <T>(apiCall: () => Promise<T>): Promise<T | null> => {
    state.loading = true
    state.error = null
    
    try {
      const result = await apiCall()
      return result
    } catch (error: any) {
      state.error = error.response?.data?.message || error.message || 'Unknown error occurred'
      console.error('API Error:', error)
      return null
    } finally {
      state.loading = false
    }
  }

  return {
    state,
    handleApiCall
  }
}

export function useTranslations() {
  const { state, handleApiCall } = useApi()
  const translations = ref<TranslationModel[]>([])
  
  // Flatten translations into voices list
  const voices = computed<VoiceWithTranslation[]>(() => {
    return translations.value.flatMap(translation => 
      translation.voices.map(voice => ({
        ...voice,
        translation: {
          code: translation.code,
          alias: translation.alias,
          name: translation.name,
          description: translation.description,
          language: translation.language,
          active: translation.active
        }
      }))
    )
  })
  
  const fetchTranslations = async (params?: TranslationListParams) => {
    const result = await handleApiCall(() => apiService.getTranslations(params))
    if (result) {
      translations.value = result
    }
  }

  return {
    state,
    translations,
    voices,
    fetchTranslations
  }
}

export function useLanguages() {
  const { state, handleApiCall } = useApi()
  const languages = ref<LanguageModel[]>([])

  const fetchLanguages = async () => {
    const result = await handleApiCall(() => apiService.getLanguages())
    if (result) {
      languages.value = result
    }
  }

  return {
    state,
    languages,
    fetchLanguages
  }
}

export function useVoiceAnomalies() {
  const { state, handleApiCall } = useApi()
  const anomalies = ref<VoiceAnomalyModel[]>([])
  const totalCount = ref(0)
  const currentPage = ref(1)
  const pageSize = ref(50)
  const selectedVoiceCode = ref<number | null>(null)
  const selectedAnomalyType = ref<string | null>(null)
  const selectedBookNumber = ref<number | null>(null)
  const selectedSortBy = ref<'address' | 'type' | 'ratio'>('ratio')
  const selectedSortOrder = ref<'asc' | 'desc'>('desc')

  const fetchAnomalies = async (voiceCode: number, params?: VoiceAnomalyListParams) => {
    selectedVoiceCode.value = voiceCode
    const result = await handleApiCall(() => apiService.getVoiceAnomalies(voiceCode, params))
    if (result) {
      anomalies.value = result.items
      totalCount.value = result.total_count
    }
  }

  const loadPage = async (page: number) => {
    if (selectedVoiceCode.value) {
      currentPage.value = page
      await fetchAnomalies(selectedVoiceCode.value, {
        page: currentPage.value,
        limit: pageSize.value,
        anomaly_type: selectedAnomalyType.value || undefined,
        book_number: selectedBookNumber.value || undefined,
        sort_by: selectedSortBy.value,
        sort_order: selectedSortOrder.value
      })
    }
  }

  const refreshAnomalies = async () => {
    if (selectedVoiceCode.value) {
      await fetchAnomalies(selectedVoiceCode.value, {
        page: currentPage.value,
        limit: pageSize.value,
        anomaly_type: selectedAnomalyType.value || undefined,
        book_number: selectedBookNumber.value || undefined,
        sort_by: selectedSortBy.value,
        sort_order: selectedSortOrder.value
      })
    }
  }

  const setAnomalyTypeFilter = async (anomalyType: string | null) => {
    selectedAnomalyType.value = anomalyType
    currentPage.value = 1 // Reset to first page when filtering
    if (selectedVoiceCode.value) {
      await fetchAnomalies(selectedVoiceCode.value, {
        page: 1,
        limit: pageSize.value,
        anomaly_type: anomalyType || undefined,
        book_number: selectedBookNumber.value || undefined,
        sort_by: selectedSortBy.value,
        sort_order: selectedSortOrder.value
      })
    }
  }

  const setBookFilter = async (bookNumber: number | null) => {
    selectedBookNumber.value = bookNumber
    currentPage.value = 1 // Reset to first page when filtering
    if (selectedVoiceCode.value) {
      await fetchAnomalies(selectedVoiceCode.value, {
        page: 1,
        limit: pageSize.value,
        anomaly_type: selectedAnomalyType.value || undefined,
        book_number: bookNumber || undefined,
        sort_by: selectedSortBy.value,
        sort_order: selectedSortOrder.value
      })
    }
  }

  const setSortBy = async (sortBy: 'address' | 'type' | 'ratio', sortOrder: 'asc' | 'desc' = 'asc') => {
    selectedSortBy.value = sortBy
    selectedSortOrder.value = sortOrder
    currentPage.value = 1 // Reset to first page when sorting changes
    if (selectedVoiceCode.value) {
      await fetchAnomalies(selectedVoiceCode.value, {
        page: 1,
        limit: pageSize.value,
        anomaly_type: selectedAnomalyType.value || undefined,
        book_number: selectedBookNumber.value || undefined,
        sort_by: sortBy,
        sort_order: sortOrder
      })
    }
  }

  return {
    state,
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
  }
}

export function useBooks() {
  const { state, handleApiCall } = useApi()
  const books = ref<BookModel[]>([])
  const selectedTranslationCode = ref<number | null>(null)

  const fetchBooks = async (translationCode: number) => {
    selectedTranslationCode.value = translationCode
    const result = await handleApiCall(() => apiService.getTranslationBooks(translationCode))
    if (result) {
      books.value = result
    }
  }

  const clearBooks = () => {
    books.value = []
    selectedTranslationCode.value = null
  }

  return {
    state,
    books,
    selectedTranslationCode,
    fetchBooks,
    clearBooks
  }
}
