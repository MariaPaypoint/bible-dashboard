<template>
    <div class="w-full">
        <DataTable :value="bibles" tableStyle="min-width: 50rem" paginator :rows="10" 
                   :rowsPerPageOptions="[5, 10, 20, 50]" stripedRows>
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xl font-bold">Bible List</span>
                    <Button icon="pi pi-refresh" rounded raised @click="loadBibles" />
                </div>
            </template>
            
            <Column field="id" header="ID" sortable style="width: 10%"></Column>
            <Column field="name" header="Name" sortable style="width: 30%"></Column>
            <Column field="language" header="Language" sortable style="width: 20%"></Column>
            <Column field="version" header="Version" sortable style="width: 20%"></Column>
            <Column field="status" header="Status" sortable style="width: 15%">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.status" 
                         :severity="getStatusSeverity(slotProps.data.status)" />
                </template>
            </Column>
            <Column header="Actions" style="width: 5%">
                <template #body="slotProps">
                    <Button icon="pi pi-eye" rounded text @click="viewBible(slotProps.data)" 
                            v-tooltip.top="'View Details'" />
                </template>
            </Column>
            
            <template #footer>
                Total: {{ bibles ? bibles.length : 0 }} bibles
            </template>
        </DataTable>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import type { BibleItem, StatusSeverity } from '../types/components'

// Sample data for demonstration
const bibles = ref<BibleItem[]>([
    {
        id: 1,
        name: 'King James Version',
        language: 'English',
        version: 'KJV',
        status: 'Active'
    },
    {
        id: 2,
        name: 'New International Version',
        language: 'English',
        version: 'NIV',
        status: 'Active'
    },
    {
        id: 3,
        name: 'English Standard Version',
        language: 'English',
        version: 'ESV',
        status: 'Active'
    },
    {
        id: 4,
        name: 'New American Standard Bible',
        language: 'English',
        version: 'NASB',
        status: 'Inactive'
    },
    {
        id: 5,
        name: 'Синодальный перевод',
        language: 'Russian',
        version: 'SYNO',
        status: 'Active'
    },
    {
        id: 6,
        name: 'Современный русский перевод',
        language: 'Russian',
        version: 'CRT',
        status: 'Processing'
    },
    {
        id: 7,
        name: 'Luther Bibel',
        language: 'German',
        version: 'LUT',
        status: 'Active'
    },
    {
        id: 8,
        name: 'La Sainte Bible',
        language: 'French',
        version: 'LSG',
        status: 'Active'
    },
    {
        id: 9,
        name: 'Reina-Valera',
        language: 'Spanish',
        version: 'RVR',
        status: 'Error'
    },
    {
        id: 10,
        name: 'Biblia Hebraica',
        language: 'Hebrew',
        version: 'BHS',
        status: 'Active'
    },
    {
        id: 11,
        name: 'Novum Testamentum Graece',
        language: 'Greek',
        version: 'NA28',
        status: 'Active'
    },
    {
        id: 12,
        name: 'Vulgata',
        language: 'Latin',
        version: 'VUL',
        status: 'Inactive'
    }
])

const loadBibles = (): void => {
    // Here you would typically load data from an API
    console.log('Loading bibles...')
}

const viewBible = (bible: BibleItem): void => {
    console.log('Viewing bible:', bible)
    // Here you would implement the view logic
}

const getStatusSeverity = (status: BibleItem['status']): StatusSeverity => {
    switch (status) {
        case 'Active':
            return 'success'
        case 'Processing':
            return 'warn'
        case 'Error':
            return 'danger'
        case 'Inactive':
            return 'secondary'
        default:
            return 'info'
    }
}

onMounted(() => {
    loadBibles()
})
</script>
