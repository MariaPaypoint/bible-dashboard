<template>
    <div class="w-full">
        <DataTable :value="voices" tableStyle="min-width: 50rem" paginator :rows="10" 
                   :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows
                   filterDisplay="row" v-model:filters="filters">
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xl font-bold">Voices</span>
                    <div class="flex items-center gap-3">
                        <div class="flex items-center gap-2">
                            <SelectButton v-model="onlyActive" @change="loadVoices" 
                                         :options="[{ label: 'Only Active', value: true }, { label: 'All', value: false } ]" 
                                         optionLabel="label" optionValue="value" />
                        </div>
                        <Button icon="pi pi-refresh" rounded raised @click="loadVoices" />
                    </div>
                </div>
            </template>
            
            <Column field="translation.language" header="Language" sortable style="width: 15%" :showFilterMenu="false" :filterFunction="filterByLanguage">
                <template #body="slotProps">
                    <span :style="getLoadingStyles()">
                        {{ getLanguageDisplayName(slotProps.data.translation.language) }}
                    </span>
                </template>
                <template #filter="{filterModel, filterCallback}">
                    <Dropdown :modelValue="filterModel ? filterModel.value : null" 
                              @update:modelValue="(value: string) => { if (filterModel) { filterModel.value = value; filterCallback(); } }"
                              :options="languageOptions" optionLabel="label" optionValue="value"
                              placeholder="Select Language" class="p-column-filter" :showClear="true">
                    </Dropdown>
                </template>
            </Column>
            <Column field="translation.name" header="Translation" sortable style="width: 20%" :showFilterMenu="false" :filterFunction="filterByTranslation">
                <template #body="slotProps">
                    <div class="flex items-center gap-2" :style="{...getInactiveStyles(slotProps.data.translation.active), ...getLoadingStyles()}">
                        <Tag :value="slotProps.data.translation.name" 
                             :style="{ 
                                 backgroundColor: getTranslationColor(slotProps.data.translation.name), 
                                 color: getTextColor(getTranslationColor(slotProps.data.translation.name)), 
                                 border: 'none',
                                 fontWeight: '500',
                             }" />
                        <span>
                            {{ slotProps.data.translation.description || slotProps.data.translation.name }}
                        </span>
                    </div>
                </template>
                <template #filter="{filterModel, filterCallback}">
                    <Dropdown :modelValue="filterModel ? filterModel.value : null" 
                              @update:modelValue="(value: string) => { if (filterModel) { filterModel.value = value; filterCallback(); } }"
                              :options="translationOptions" optionLabel="label" optionValue="value"
                              placeholder="Select Translation" class="p-column-filter" :showClear="true">
                    </Dropdown>
                </template>
            </Column>
            <Column header="Voice Code/Alias" sortable style="width: 20%" :showFilterMenu="false" :sortFunction="sortByCodeAlias">
                <template #body="slotProps">
                    <div :style="{...getInactiveStyles(slotProps.data.active), ...getLoadingStyles()}" class="flex flex-row gap-1 items-center">
                        <span class="font-medium">{{ slotProps.data.code }}</span>
                        <span class="text-gray-400">/</span>
                        <span>{{ slotProps.data.alias }}</span>
                    </div>
                </template>
                <template #filter="{filterModel, filterCallback}">
                    <InputText :modelValue="filterModel ? filterModel.value : null" 
                               @update:modelValue="(value: string) => { if (filterModel) { filterModel.value = value; filterCallback(); } }"
                               placeholder="Search code/alias..." class="p-column-filter" />
                </template>
            </Column>
            <Column field="name" header="Voice Name" sortable style="width: 25%" :showFilterMenu="false">
                <template #body="slotProps">
                    <span :style="{...getInactiveStyles(slotProps.data.active), ...getLoadingStyles()}">
                        {{ slotProps.data.name }}
                    </span>
                </template>
                <template #filter="{filterModel, filterCallback}">
                    <InputText :modelValue="filterModel ? filterModel.value : null" 
                               @update:modelValue="(value: string) => { if (filterModel) { filterModel.value = value; filterCallback(); } }"
                               placeholder="Search voice name..." class="p-column-filter" />
                </template>
            </Column>
            <Column header="Music" style="width: 10%">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.is_music ? 'Yes' : 'No'" 
                         :severity="slotProps.data.is_music ? 'success' : 'secondary'"
                         :style="{...getInactiveStyles(slotProps.data.active), ...getLoadingStyles()}" />
                </template>
            </Column>
            <Column header="Actions" style="width: 5%">
                <template #body="slotProps">
                    <Button icon="pi pi-eye" rounded text @click="viewVoice(slotProps.data)" 
                            title="View Voice Details" 
                            :style="{...getInactiveStyles(slotProps.data.active), ...getLoadingStyles()}"
                            :disabled="state.loading" />
                </template>
            </Column>
            
            <template #footer>
                Total: {{ voices ? voices.length : 0 }} voices
            </template>
        </DataTable>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext'
import SelectButton from 'primevue/selectbutton'
// Define FilterMatchMode manually since import path varies by PrimeVue version
const FilterMatchMode = {
    EQUALS: 'equals',
    NOT_EQUALS: 'notEquals',
    CONTAINS: 'contains'
}
import { useTranslations, useLanguages } from '../composables/useApi'
import type { VoiceWithTranslation } from '../composables/useApi'
import type { LanguageModel } from '../types/api'

const { state, voices, fetchTranslations } = useTranslations()
const { languages, fetchLanguages } = useLanguages()

// Only active filter state
const onlyActive = ref<boolean>(false)

// Initialize filters for proper filtering functionality
const filters = ref({
    'translation.language': { value: null, matchMode: FilterMatchMode.EQUALS },
    'translation.name': { value: null, matchMode: FilterMatchMode.EQUALS },
    'name': { value: null, matchMode: FilterMatchMode.CONTAINS },
    'alias': { value: null, matchMode: FilterMatchMode.CONTAINS }
})

// Custom filter functions for nested fields
const filterByLanguage = (value: any, filter: string) => {
    if (!filter) return true
    return value?.translation?.language === filter
}

const filterByTranslation = (value: any, filter: string) => {
    if (!filter) return true
    return value?.translation?.name === filter
}

// Custom sort function for combined Code/Alias column
const sortByCodeAlias = (event: any) => {
    const data = [...voices.value]
    const order = event.order
    
    return data.sort((a, b) => {
        const aValue = String(a.code || '')
        const bValue = String(b.code || '')
        
        // If codes are the same, sort by alias
        if (aValue === bValue) {
            const aAlias = String(a.alias || '')
            const bAlias = String(b.alias || '')
            return order * aAlias.localeCompare(bAlias)
        }
        
        return order * aValue.localeCompare(bValue)
    })
}

const loadVoices = async (): Promise<void> => {
    const onlyActiveParam = onlyActive.value ? 1 : 0
    console.log('Loading voices and languages...', { only_active: onlyActiveParam })
    await Promise.all([
        fetchTranslations({ only_active: onlyActiveParam }),
        fetchLanguages()
    ])
}

const viewVoice = (voice: VoiceWithTranslation): void => {
    console.log('Viewing voice:', voice)
    // TODO: Implement voice view functionality
}

const getLanguageDisplayName = (languageCode: string): string => {
    const language = languages.value.find(lang => lang.alias === languageCode)
    return language ? language.name_national : languageCode
}

// Generate consistent color for translation based on its value
const getTranslationColor = (translationName: string): string => {
    // Simple hash function to generate consistent color from string
    let hash = 0
    for (let i = 0; i < translationName.length; i++) {
        const char = translationName.charCodeAt(i)
        hash = ((hash << 10) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
    }
    
    // Convert hash to hue (0-360)
    const hue = Math.abs(hash) % 360
    
    // Calculate saturation mathematically from hash (60-80% range)
    const saturation = 60 + (Math.abs(hash >> 8) % 21) // 60 + (0-20) = 60-80%
    const lightness = 40 + (Math.abs(hash >> 8) % 21) // 40 + (0-20) = 40-60%
    
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`
}

// Generate text color based on background brightness for optimal contrast
const getTextColor = (backgroundColor: string): string => {
    // Extract HSL values from backgroundColor
    const hslMatch = backgroundColor.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/)
    if (!hslMatch) return 'white'
    
    const lightness = parseInt(hslMatch[3])
    
    // Use white text for dark backgrounds, dark text for light backgrounds
    return lightness < 60 ? 'white' : '#333333'
}

// Get styles for inactive elements (pale/faded appearance)
const getInactiveStyles = (isActive: boolean) => {
    if (isActive) return {}
    
    return {
        opacity: '0.4',
    }
}

// Get styles for loading state (dim appearance during data fetch)
const getLoadingStyles = () => {
    if (!state.loading) return {}
    
    return {
        opacity: '0.6',
        pointerEvents: 'none',
        transition: 'opacity 0.3s ease'
    }
}

// Filter options for dropdowns
const languageOptions = computed(() => {
    const uniqueLanguages = [...new Set(voices.value.map(voice => voice.translation.language))]
    return uniqueLanguages.map(langCode => ({
        label: getLanguageDisplayName(langCode),
        value: langCode
    }))
})

const translationOptions = computed(() => {
    const uniqueTranslations = [...new Set(voices.value.map(voice => voice.translation.name))]
    return uniqueTranslations.map(translation => ({
        label: translation,
        value: translation
    }))
})

onMounted(() => {
    loadVoices()
})
</script>
