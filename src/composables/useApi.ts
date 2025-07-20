import { ref, reactive } from 'vue'
import { apiService } from '../services/api'
import type { Bible, BibleError, BibleListParams, ErrorListParams, PaginatedResponse } from '../types/api'

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

export function useBibles() {
  const { state, handleApiCall } = useApi()
  const bibles = ref<Bible[]>([])
  const totalBibles = ref(0)
  const currentPage = ref(1)
  const totalPages = ref(0)

  const fetchBibles = async (params?: BibleListParams) => {
    const result = await handleApiCall(() => apiService.getBibles(params))
    if (result) {
      bibles.value = result.items
      totalBibles.value = result.total
      currentPage.value = result.page
      totalPages.value = result.pages
    }
  }

  const fetchBible = async (id: string) => {
    return await handleApiCall(() => apiService.getBible(id))
  }

  const createBible = async (bible: Omit<Bible, 'id' | 'created_at' | 'updated_at'>) => {
    const result = await handleApiCall(() => apiService.createBible(bible))
    if (result) {
      await fetchBibles() // Refresh list
    }
    return result
  }

  const updateBible = async (id: string, bible: Partial<Bible>) => {
    const result = await handleApiCall(() => apiService.updateBible(id, bible))
    if (result) {
      await fetchBibles() // Refresh list
    }
    return result
  }

  const deleteBible = async (id: string) => {
    const result = await handleApiCall(() => apiService.deleteBible(id))
    if (result !== null) {
      await fetchBibles() // Refresh list
    }
    return result
  }

  return {
    state,
    bibles,
    totalBibles,
    currentPage,
    totalPages,
    fetchBibles,
    fetchBible,
    createBible,
    updateBible,
    deleteBible
  }
}

export function useBibleErrors() {
  const { state, handleApiCall } = useApi()
  const errors = ref<BibleError[]>([])
  const totalErrors = ref(0)
  const currentPage = ref(1)
  const totalPages = ref(0)

  const fetchErrors = async (params?: ErrorListParams) => {
    const result = await handleApiCall(() => apiService.getErrors(params))
    if (result) {
      errors.value = result.items
      totalErrors.value = result.total
      currentPage.value = result.page
      totalPages.value = result.pages
    }
  }

  const fetchError = async (id: string) => {
    return await handleApiCall(() => apiService.getError(id))
  }

  const resolveError = async (id: string) => {
    const result = await handleApiCall(() => apiService.resolveError(id))
    if (result) {
      await fetchErrors() // Refresh list
    }
    return result
  }

  return {
    state,
    errors,
    totalErrors,
    currentPage,
    totalPages,
    fetchErrors,
    fetchError,
    resolveError
  }
}
