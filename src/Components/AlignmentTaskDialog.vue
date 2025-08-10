<template>
  <Dialog 
    v-model:visible="visible" 
    modal 
    :header="'Создать новое задание выравнивания'"
    :style="{ width: '50rem' }" 
    :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    class="p-fluid"
    :closable="!loading"
    :closeOnEscape="!loading"
  >
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
      <!-- File Upload Section -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Audio File -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-900 dark:text-surface-0">
            Аудиофайл <span class="text-red-500">*</span>
          </label>
          <FileUpload
            ref="audioFileUpload"
            mode="basic"
            :auto="false"
            :multiple="false"
            accept="audio/mp3,audio/wav,.mp3,.wav"
            :maxFileSize="100000000"
            chooseLabel="Выбрать аудиофайл"
            class="w-full"
            @select="onAudioFileSelect"
            @clear="formData.audio_file = null"
            :class="{ 'p-invalid': errors.audio_file }"
          />
          <small v-if="errors.audio_file" class="text-red-500">{{ errors.audio_file }}</small>
          <small class="text-surface-500">Поддерживаемые форматы: MP3, WAV (макс. 100MB)</small>
        </div>

        <!-- Text File -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-900 dark:text-surface-0">
            Текстовый файл <span class="text-red-500">*</span>
          </label>
          <FileUpload
            ref="textFileUpload"
            mode="basic"
            :auto="false"
            :multiple="false"
            accept="text/plain,.txt"
            :maxFileSize="10000000"
            chooseLabel="Выбрать текстовый файл"
            class="w-full"
            @select="onTextFileSelect"
            @clear="formData.text_file = null"
            :class="{ 'p-invalid': errors.text_file }"
          />
          <small v-if="errors.text_file" class="text-red-500">{{ errors.text_file }}</small>
          <small class="text-surface-500">Поддерживаемые форматы: TXT (макс. 10MB)</small>
        </div>
      </div>

      <!-- Language Selection -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-surface-900 dark:text-surface-0">
          Язык <span class="text-red-500">*</span>
        </label>
        <Select
          v-model="selectedLanguage"
          :options="languages"
          optionLabel="name"
          optionValue="code"
          placeholder="Выберите язык"
          :loading="loadingLanguages"
          @change="onLanguageChange"
          :class="{ 'p-invalid': errors.language }"
          filter
          filterPlaceholder="Поиск языка..."
        />
        <small v-if="errors.language" class="text-red-500">{{ errors.language }}</small>
      </div>

      <!-- Models Selection -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Acoustic Model -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-900 dark:text-surface-0">
            Акустическая модель <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="selectedAcousticModel"
            :options="acousticModels"
            :optionLabel="(model) => `${model.name} v${model.version}`"
            placeholder="Выберите акустическую модель"
            :loading="loadingModels"
            :disabled="!selectedLanguage"
            :class="{ 'p-invalid': errors.acoustic_model }"
          >
            <template #option="slotProps">
              <div class="flex flex-col">
                <span class="font-medium">{{ slotProps.option.name }} v{{ slotProps.option.version }}</span>
                <small v-if="slotProps.option.description" class="text-surface-500">
                  {{ slotProps.option.description }}
                </small>
              </div>
            </template>
          </Select>
          <small v-if="errors.acoustic_model" class="text-red-500">{{ errors.acoustic_model }}</small>
        </div>

        <!-- Dictionary Model -->
        <div class="flex flex-col gap-2">
          <label class="text-sm font-medium text-surface-900 dark:text-surface-0">
            Словарная модель <span class="text-red-500">*</span>
          </label>
          <Select
            v-model="selectedDictionaryModel"
            :options="dictionaryModels"
            :optionLabel="(model) => `${model.name} v${model.version}`"
            placeholder="Выберите словарную модель"
            :loading="loadingModels"
            :disabled="!selectedLanguage"
            :class="{ 'p-invalid': errors.dictionary_model }"
          >
            <template #option="slotProps">
              <div class="flex flex-col">
                <span class="font-medium">{{ slotProps.option.name }} v{{ slotProps.option.version }}</span>
                <small v-if="slotProps.option.description" class="text-surface-500">
                  {{ slotProps.option.description }}
                </small>
              </div>
            </template>
          </Select>
          <small v-if="errors.dictionary_model" class="text-red-500">{{ errors.dictionary_model }}</small>
        </div>
      </div>

      <!-- G2P Model (Optional) -->
      <div class="flex flex-col gap-2">
        <label class="text-sm font-medium text-surface-900 dark:text-surface-0">
          G2P модель (опционально)
        </label>
        <Select
          v-model="selectedG2PModel"
          :options="g2pModels"
          :optionLabel="(model) => `${model.name} v${model.version}`"
          placeholder="Выберите G2P модель (опционально)"
          :loading="loadingModels"
          :disabled="!selectedLanguage"
          showClear
        >
          <template #option="slotProps">
            <div class="flex flex-col">
              <span class="font-medium">{{ slotProps.option.name }} v{{ slotProps.option.version }}</span>
              <small v-if="slotProps.option.description" class="text-surface-500">
                {{ slotProps.option.description }}
              </small>
            </div>
          </template>
        </Select>
        <small class="text-surface-500">G2P модель используется для генерации произношения неизвестных слов</small>
      </div>
    </form>

    <template #footer>
      <div class="flex justify-end gap-2">
        <Button 
          label="Отмена" 
          severity="secondary" 
          @click="handleCancel"
          :disabled="loading"
        />
        <Button 
          label="Создать задание" 
          @click="handleSubmit"
          :loading="loading"
          :disabled="!isFormValid"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Select from 'primevue/select'
import FileUpload from 'primevue/fileupload'
import { alignmentApiService } from '../services/api'
import type { 
  LanguageResponse, 
  MFAModelResponse, 
  CreateAlignmentTaskRequest,
  AlignmentTaskResponse 
} from '../types/api'

// Props
interface Props {
  visible: boolean
}

// Emits
interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'task-created', task: AlignmentTaskResponse): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Composables
const toast = useToast()

// Reactive state
const loading = ref(false)
const loadingLanguages = ref(false)
const loadingModels = ref(false)

// Form data
const formData = ref<Partial<CreateAlignmentTaskRequest>>({
  audio_file: null,
  text_file: null,
  acoustic_model_name: '',
  acoustic_model_version: '',
  dictionary_model_name: '',
  dictionary_model_version: '',
  g2p_model_name: undefined,
  g2p_model_version: undefined
})

// Selection state
const selectedLanguage = ref<string | null>(null)
const selectedAcousticModel = ref<MFAModelResponse | null>(null)
const selectedDictionaryModel = ref<MFAModelResponse | null>(null)
const selectedG2PModel = ref<MFAModelResponse | null>(null)

// Data arrays
const languages = ref<LanguageResponse[]>([])
const acousticModels = ref<MFAModelResponse[]>([])
const dictionaryModels = ref<MFAModelResponse[]>([])
const g2pModels = ref<MFAModelResponse[]>([])

// Validation errors
const errors = ref<Record<string, string>>({})

// File upload refs
const audioFileUpload = ref()
const textFileUpload = ref()

// Computed
const visible = computed({
  get: () => props.visible,
  set: (value) => emit('update:visible', value)
})

const isFormValid = computed(() => {
  return formData.value.audio_file &&
         formData.value.text_file &&
         selectedLanguage.value &&
         selectedAcousticModel.value &&
         selectedDictionaryModel.value &&
         Object.keys(errors.value).length === 0
})

// Methods
const loadLanguages = async () => {
  loadingLanguages.value = true
  try {
    languages.value = await alignmentApiService.getSupportedLanguages()
  } catch (error: any) {
    console.error('Error loading languages:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось загрузить список языков',
      life: 3000
    })
  } finally {
    loadingLanguages.value = false
  }
}

const loadModels = async (language: string) => {
  if (!language) return
  
  loadingModels.value = true
  try {
    const [acoustic, dictionary, g2p] = await Promise.all([
      alignmentApiService.getMFAModelsByType('acoustic', language),
      alignmentApiService.getMFAModelsByType('dictionary', language),
      alignmentApiService.getMFAModelsByType('g2p', language)
    ])
    
    acousticModels.value = acoustic
    dictionaryModels.value = dictionary
    g2pModels.value = g2p
  } catch (error: any) {
    console.error('Error loading models:', error)
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: 'Не удалось загрузить модели для выбранного языка',
      life: 3000
    })
  } finally {
    loadingModels.value = false
  }
}

const onLanguageChange = () => {
  // Reset model selections when language changes
  selectedAcousticModel.value = null
  selectedDictionaryModel.value = null
  selectedG2PModel.value = null
  
  // Clear model form data
  formData.value.acoustic_model_name = ''
  formData.value.acoustic_model_version = ''
  formData.value.dictionary_model_name = ''
  formData.value.dictionary_model_version = ''
  formData.value.g2p_model_name = undefined
  formData.value.g2p_model_version = undefined
  
  // Load models for new language
  if (selectedLanguage.value) {
    loadModels(selectedLanguage.value)
  }
  
  validateForm()
}

const onAudioFileSelect = (event: any) => {
  const file = event.files[0]
  if (file) {
    formData.value.audio_file = file
    validateForm()
  }
}

const onTextFileSelect = (event: any) => {
  const file = event.files[0]
  if (file) {
    formData.value.text_file = file
    validateForm()
  }
}

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.audio_file) {
    errors.value.audio_file = 'Аудиофайл обязателен'
  }
  
  if (!formData.value.text_file) {
    errors.value.text_file = 'Текстовый файл обязателен'
  }
  
  if (!selectedLanguage.value) {
    errors.value.language = 'Выберите язык'
  }
  
  if (!selectedAcousticModel.value) {
    errors.value.acoustic_model = 'Выберите акустическую модель'
  }
  
  if (!selectedDictionaryModel.value) {
    errors.value.dictionary_model = 'Выберите словарную модель'
  }
}

const resetForm = () => {
  formData.value = {
    audio_file: null,
    text_file: null,
    acoustic_model_name: '',
    acoustic_model_version: '',
    dictionary_model_name: '',
    dictionary_model_version: '',
    g2p_model_name: undefined,
    g2p_model_version: undefined
  }
  
  selectedLanguage.value = null
  selectedAcousticModel.value = null
  selectedDictionaryModel.value = null
  selectedG2PModel.value = null
  
  errors.value = {}
  
  // Clear file uploads
  if (audioFileUpload.value) {
    audioFileUpload.value.clear()
  }
  if (textFileUpload.value) {
    textFileUpload.value.clear()
  }
}

const handleSubmit = async () => {
  validateForm()
  
  if (!isFormValid.value) {
    toast.add({
      severity: 'warn',
      summary: 'Внимание',
      detail: 'Пожалуйста, заполните все обязательные поля',
      life: 3000
    })
    return
  }
  
  loading.value = true
  
  try {
    // Prepare form data
    const taskData: CreateAlignmentTaskRequest = {
      audio_file: formData.value.audio_file!,
      text_file: formData.value.text_file!,
      acoustic_model_name: selectedAcousticModel.value!.name,
      acoustic_model_version: selectedAcousticModel.value!.version,
      dictionary_model_name: selectedDictionaryModel.value!.name,
      dictionary_model_version: selectedDictionaryModel.value!.version,
    }
    
    // Add G2P model if selected
    if (selectedG2PModel.value) {
      taskData.g2p_model_name = selectedG2PModel.value.name
      taskData.g2p_model_version = selectedG2PModel.value.version
    }
    
    // Create task
    const createdTask = await alignmentApiService.createAlignmentTask(taskData)
    
    toast.add({
      severity: 'success',
      summary: 'Успех',
      detail: 'Задание выравнивания успешно создано',
      life: 3000
    })
    
    emit('task-created', createdTask)
    visible.value = false
    resetForm()
    
  } catch (error: any) {
    console.error('Error creating alignment task:', error)
    
    let errorMessage = 'Не удалось создать задание выравнивания'
    if (error.response?.data?.detail) {
      if (Array.isArray(error.response.data.detail)) {
        errorMessage = error.response.data.detail.map((err: any) => err.msg).join(', ')
      } else {
        errorMessage = error.response.data.detail
      }
    }
    
    toast.add({
      severity: 'error',
      summary: 'Ошибка',
      detail: errorMessage,
      life: 5000
    })
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  visible.value = false
  resetForm()
}

// Watchers
watch(() => selectedAcousticModel.value, (newModel) => {
  if (newModel) {
    formData.value.acoustic_model_name = newModel.name
    formData.value.acoustic_model_version = newModel.version
    
    // Auto-select dictionary model with the same version
    const matchingDictionary = dictionaryModels.value.find(
      model => model.version === newModel.version
    )
    if (matchingDictionary && !selectedDictionaryModel.value) {
      selectedDictionaryModel.value = matchingDictionary
    }
  }
  validateForm()
})

watch(() => selectedDictionaryModel.value, (newModel) => {
  if (newModel) {
    formData.value.dictionary_model_name = newModel.name
    formData.value.dictionary_model_version = newModel.version
    
    // Auto-select acoustic model with the same version
    const matchingAcoustic = acousticModels.value.find(
      model => model.version === newModel.version
    )
    if (matchingAcoustic && !selectedAcousticModel.value) {
      selectedAcousticModel.value = matchingAcoustic
    }
  }
  validateForm()
})

watch(() => selectedG2PModel.value, (newModel) => {
  if (newModel) {
    formData.value.g2p_model_name = newModel.name
    formData.value.g2p_model_version = newModel.version
  } else {
    formData.value.g2p_model_name = undefined
    formData.value.g2p_model_version = undefined
  }
})

// Lifecycle
onMounted(() => {
  loadLanguages()
})
</script>

<style scoped>
:deep(.p-fileupload-basic) {
  width: 100%;
}

:deep(.p-fileupload-basic .p-button) {
  width: 100%;
  justify-content: center;
}

:deep(.p-invalid) {
  border-color: #ef4444;
}
</style>
