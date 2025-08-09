import { ref, computed } from 'vue'
import { useToast } from 'primevue/usetoast'
import { alignmentApiService } from '../services/api'
import type { 
  AlignmentTaskResponse, 
  AlignmentStatus,
  CreateAlignmentTaskRequest,
  MFAModelResponse,
  LanguageResponse
} from '../types/api'

export function useAlignmentTasks() {
  const toast = useToast()
  
  // State
  const tasks = ref<AlignmentTaskResponse[]>([])
  const loading = ref(false)
  const selectedStatus = ref<AlignmentStatus | null>(null)
  
  // Models data
  const languages = ref<LanguageResponse[]>([])
  const acousticModels = ref<{ displayName: string; value: string; name: string; version: string }[]>([])
  const dictionaryModels = ref<{ displayName: string; value: string; name: string; version: string }[]>([])
  const g2pModels = ref<{ displayName: string; value: string; name: string; version: string }[]>([])
  
  // Computed
  const taskCountByStatus = computed(() => {
    const counts = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0
    }
    
    tasks.value.forEach(task => {
      counts[task.status]++
    })
    
    return counts
  })
  
  // Methods
  const loadTasks = async (status?: AlignmentStatus | null) => {
    loading.value = true
    try {
      const params = status ? { status } : {}
      tasks.value = await alignmentApiService.getAlignmentTasks(params)
    } catch (error: any) {
      console.error('Error loading tasks:', error)
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось загрузить задачи выравнивания',
        life: 3000
      })
    } finally {
      loading.value = false
    }
  }
  
  const loadLanguages = async () => {
    try {
      languages.value = await alignmentApiService.getSupportedLanguages()
    } catch (error) {
      console.error('Error loading languages:', error)
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось загрузить языки',
        life: 3000
      })
    }
  }
  
  const loadModelsForLanguage = async (languageCode: string) => {
    try {
      // Load acoustic models
      const acousticModelsData = await alignmentApiService.getMFAModelsByType('acoustic', languageCode)
      acousticModels.value = acousticModelsData.map(model => ({
        displayName: `${model.name} v${model.version}`,
        value: `${model.name}|${model.version}`,
        name: model.name,
        version: model.version
      }))
      
      // Load dictionary models
      const dictionaryModelsData = await alignmentApiService.getMFAModelsByType('dictionary', languageCode)
      dictionaryModels.value = dictionaryModelsData.map(model => ({
        displayName: `${model.name} v${model.version}`,
        value: `${model.name}|${model.version}`,
        name: model.name,
        version: model.version
      }))
      
      // Load G2P models
      const g2pModelsData = await alignmentApiService.getMFAModelsByType('g2p', languageCode)
      g2pModels.value = g2pModelsData.map(model => ({
        displayName: `${model.name} v${model.version}`,
        value: `${model.name}|${model.version}`,
        name: model.name,
        version: model.version
      }))
    } catch (error) {
      console.error('Error loading models:', error)
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось загрузить модели для выбранного языка',
        life: 3000
      })
    }
  }
  
  const createTask = async (taskData: CreateAlignmentTaskRequest) => {
    try {
      const newTask = await alignmentApiService.createAlignmentTask(taskData)
      tasks.value.unshift(newTask) // Add to beginning of list
      
      toast.add({
        severity: 'success',
        summary: 'Успех',
        detail: 'Задача выравнивания создана успешно',
        life: 3000
      })
      
      return newTask
    } catch (error: any) {
      console.error('Error creating task:', error)
      let errorMessage = 'Не удалось создать задачу выравнивания'
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: errorMessage,
        life: 5000
      })
      
      throw error
    }
  }
  
  const deleteTask = async (taskId: number) => {
    try {
      await alignmentApiService.deleteAlignmentTask(taskId)
      tasks.value = tasks.value.filter(task => task.id !== taskId)
      
      toast.add({
        severity: 'success',
        summary: 'Успех',
        detail: 'Задача удалена успешно',
        life: 3000
      })
    } catch (error: any) {
      console.error('Error deleting task:', error)
      let errorMessage = 'Не удалось удалить задачу'
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      } else if (error.message) {
        errorMessage = error.message
      }
      
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: errorMessage,
        life: 3000
      })
      
      throw error
    }
  }
  
  const getTask = async (taskId: number) => {
    try {
      return await alignmentApiService.getAlignmentTask(taskId)
    } catch (error: any) {
      console.error('Error getting task:', error)
      toast.add({
        severity: 'error',
        summary: 'Ошибка',
        detail: 'Не удалось загрузить детали задачи',
        life: 3000
      })
      throw error
    }
  }
  
  const setStatusFilter = (status: AlignmentStatus | null) => {
    selectedStatus.value = status
    loadTasks(status)
  }
  
  return {
    // State
    tasks,
    loading,
    selectedStatus,
    languages,
    acousticModels,
    dictionaryModels,
    g2pModels,
    
    // Computed
    taskCountByStatus,
    
    // Methods
    loadTasks,
    loadLanguages,
    loadModelsForLanguage,
    createTask,
    deleteTask,
    getTask,
    setStatusFilter
  }
}
