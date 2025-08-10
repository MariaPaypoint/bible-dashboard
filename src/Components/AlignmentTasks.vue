<template>
  <div class="flex flex-col gap-4">
    <!-- Filters and Controls -->
    <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 p-3 sm:p-4">
      <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <!-- Status Filter -->
        <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <label class="text-sm font-medium text-surface-900 dark:text-surface-0">Status:</label>
          <Select 
            v-model="selectedStatus" 
            :options="statusOptions" 
            optionLabel="label" 
            optionValue="value" 
            placeholder="All statuses"
            class="w-full sm:w-48"
            showClear
            @change="refreshTasks"
          />
        </div>
        
        <!-- Action Buttons -->
        <div class="flex flex-wrap gap-2">
          <Button 
            @click="showCreateDialog = true" 
            severity="success" 
            class="h-8"
          >
            <PlusIcon class="w-4 h-4 mr-1" />
            Create Task
          </Button>
          <Button 
            @click="refreshTasks" 
            severity="info" 
            class="h-8"
            :loading="loading"
          >
            <RefreshCwIcon class="w-4 h-4 mr-1" />
            Refresh
          </Button>
        </div>
      </div>
    </div>

    <!-- Tasks Table -->
    <div class="rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 overflow-hidden">
      <DataTable 
        :value="tasks" 
        :loading="loading"
        :rows="isMobile ? 10 : 15"
        :paginator="tasks.length > (isMobile ? 10 : 15)"
        :rowsPerPageOptions="[10, 15, 25, 50]"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} tasks"
        responsiveLayout="scroll"
        class="p-datatable-sm"
        :class="{ 'text-xs': isMobile }"
      >
        <Column field="id" header="Task ID" :style="{ width: '8%' }">
          <template #body="slotProps">
            <span class="font-mono text-xs">#{{ String(slotProps.data.id).padStart(4, '0') }}</span>
          </template>
        </Column>
        
        <Column field="original_audio_filename" header="Audio File" :style="{ width: '20%' }">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <FileAudioIcon class="w-4 h-4 text-surface-500" />
              <span class="truncate" :title="slotProps.data.original_audio_filename">
                {{ slotProps.data.original_audio_filename }}
              </span>
            </div>
          </template>
        </Column>
        
        <Column field="original_text_filename" header="Text File" :style="{ width: '20%' }">
          <template #body="slotProps">
            <div class="flex items-center gap-2">
              <FileTextIcon class="w-4 h-4 text-surface-500" />
              <span class="truncate" :title="slotProps.data.original_text_filename">
                {{ slotProps.data.original_text_filename }}
              </span>
            </div>
          </template>
        </Column>
        
        <Column field="acoustic_model" header="Models" :style="{ width: '18%' }">
          <template #body="slotProps">
            <div class="flex flex-col gap-1">
              <Tag severity="info" class="text-xs">
                A: {{ slotProps.data.acoustic_model.name }} v{{ slotProps.data.acoustic_model.version }}
              </Tag>
              <Tag severity="warn" class="text-xs">
                D: {{ slotProps.data.dictionary_model.name }} v{{ slotProps.data.dictionary_model.version }}
              </Tag>
              <Tag v-if="slotProps.data.g2p_model" severity="secondary" class="text-xs">
                G2P: {{ slotProps.data.g2p_model.name }} v{{ slotProps.data.g2p_model.version }}
              </Tag>
            </div>
          </template>
        </Column>
        
        <Column field="status" header="Status" :style="{ width: '12%' }">
          <template #body="slotProps">
            <Tag :severity="getStatusSeverity(slotProps.data.status)" class="text-xs">
              {{ getStatusLabel(slotProps.data.status) }}
            </Tag>
          </template>
        </Column>
        
        <Column field="created_at" header="Created" :style="{ width: '12%' }">
          <template #body="slotProps">
            <span class="text-xs text-surface-600 dark:text-surface-300">
              {{ formatDate(slotProps.data.created_at) }}
            </span>
          </template>
        </Column>
        
        <Column header="Actions" :style="{ width: '10%' }">
          <template #body="slotProps">
            <div class="flex gap-2">
              <!-- Download Result -->
              <Button 
                v-if="slotProps.data.status === 'completed' && slotProps.data.result_path"
                @click="downloadResult(slotProps.data)"
                severity="success"
                class="w-9 h-9"
                v-tooltip.top="'Download Result'"
              >
                <DownloadIcon class="-m-1" />
              </Button>
              
              <!-- View Details -->
              <Button 
                @click="viewTaskDetails(slotProps.data)"
                severity="info"
                class="w-9 h-9"
                v-tooltip.top="'View Details'"
              >
                <EyeIcon class="-m-1" />
              </Button>
              
              <!-- Delete Task -->
              <Button 
                @click="confirmDeleteTask(slotProps.data)"
                severity="danger"
                class="w-9 h-9"
                v-tooltip.top="'Delete Task'"
                :disabled="slotProps.data.status === 'processing'"
              >
                <TrashIcon class="-m-1" />
              </Button>

            </div>
          </template>
        </Column>
      </DataTable>
      
      <!-- Footer -->
      <div class="p-3 border-t border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800">
        <p class="text-xs text-surface-600 dark:text-surface-300">
          Total tasks: {{ tasks.length }} | 
          Pending: {{ getTaskCountByStatus('pending') }} | 
          Processing: {{ getTaskCountByStatus('processing') }} | 
          Completed: {{ getTaskCountByStatus('completed') }} | 
          Failed: {{ getTaskCountByStatus('failed') }}
        </p>
      </div>
    </div>

    <!-- Create Task Dialog -->
    <AlignmentTaskDialog 
      v-model:visible="showCreateDialog"
      @task-created="onTaskCreated"
    />

    <!-- Confirm Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Tag from 'primevue/tag'
import ConfirmDialog from 'primevue/confirmdialog'
import { useConfirm } from 'primevue/useconfirm'
import { 
  PlusIcon, 
  RefreshCwIcon, 
  FileAudioIcon, 
  FileTextIcon, 
  DownloadIcon, 
  EyeIcon, 
  TrashIcon 
} from 'lucide-vue-next'
import AlignmentTaskDialog from './AlignmentTaskDialog.vue'
import { alignmentApiService } from '../services/api'
import type { 
  AlignmentTaskResponse, 
  AlignmentStatus
} from '../types/api'

// Composables
const toast = useToast()
const confirm = useConfirm()

// Reactive state
const tasks = ref<AlignmentTaskResponse[]>([])
const loading = ref(false)
const selectedStatus = ref<AlignmentStatus | null>(null)
const showCreateDialog = ref(false)
const isMobile = ref(false)

// Status options
const statusOptions = [
  { label: 'All', value: null },
  { label: 'Pending', value: 'pending' },
  { label: 'Processing', value: 'processing' },
  { label: 'Completed', value: 'completed' },
  { label: 'Failed', value: 'failed' }
]

// Functions
const checkMobile = () => {
  isMobile.value = window.innerWidth < 640
}

const refreshTasks = async () => {
  loading.value = true
  try {
    const params = selectedStatus.value ? { status: selectedStatus.value } : {}
    tasks.value = await alignmentApiService.getAlignmentTasks(params)
  } catch (error: any) {
    console.error('Error loading tasks:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to load alignment tasks',
      life: 3000
    })
  } finally {
    loading.value = false
  }
}

const viewTaskDetails = (task: AlignmentTaskResponse) => {
  console.log('View task details:', task)
  // TODO: Implement task details dialog
}

const confirmDeleteTask = (task: AlignmentTaskResponse) => {
  confirm.require({
    message: `Are you sure you want to delete task #${String(task.id).padStart(4, '0')}?`,
    header: 'Delete Confirmation',
    icon: 'pi pi-exclamation-triangle',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger'
    },
    accept: () => {
      deleteTask(task)
    }
  })
}

const deleteTask = async (task: AlignmentTaskResponse) => {
  try {
    await alignmentApiService.deleteAlignmentTask(task.id)
    
    // Remove task from the list
    const index = tasks.value.findIndex(t => t.id === task.id)
    if (index !== -1) {
      tasks.value.splice(index, 1)
    }
    
    toast.add({
      severity: 'success',
      summary: 'Успех',
      detail: `Задание #${String(task.id).padStart(4, '0')} успешно удалено`,
      life: 3000
    })
  } catch (error: any) {
    console.error('Error deleting task:', error)
    
    let errorMessage = 'Не удалось удалить задание'
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.response?.status === 404) {
      errorMessage = 'Задание не найдено'
    }
    
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: errorMessage,
      life: 3000
    })
  }
}

const downloadResult = async (task: AlignmentTaskResponse) => {
  if (!task.result_path) return
  
  try {
    const link = document.createElement('a')
    link.href = `/alignment-api/results/${task.result_path}`
    link.download = `alignment_result_${task.id}.zip`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Download started',
      life: 3000
    })
  } catch (error) {
    console.error('Error downloading result:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to download result',
      life: 3000
    })
  }
}

// Utility functions
const getStatusSeverity = (status: AlignmentStatus): string => {
  switch (status) {
    case 'pending': return 'warn'
    case 'processing': return 'info'
    case 'completed': return 'success'
    case 'failed': return 'danger'
    default: return 'secondary'
  }
}

const getStatusLabel = (status: AlignmentStatus): string => {
  switch (status) {
    case 'pending': return 'Pending'
    case 'processing': return 'Processing'
    case 'completed': return 'Completed'
    case 'failed': return 'Failed'
    default: return status
  }
}

const getTaskCountByStatus = (status: AlignmentStatus): number => {
  return tasks.value.filter(task => task.status === status).length
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const onTaskCreated = (task: AlignmentTaskResponse) => {
  // Add the new task to the beginning of the list
  tasks.value.unshift(task)
  
  toast.add({
    severity: 'success',
    summary: 'Задание создано',
    detail: `Задание #${String(task.id).padStart(4, '0')} успешно добавлено в очередь`,
    life: 3000
  })
}

// Lifecycle
onMounted(async () => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
  await refreshTasks()
})
</script>

<style scoped>
/* Component-specific styles */
</style>
