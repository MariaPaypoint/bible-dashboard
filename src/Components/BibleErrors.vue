<template>
    <div class="w-full">
        <DataTable :value="errors" tableStyle="min-width: 50rem" paginator :rows="10" 
                   :rowsPerPageOptions="[5, 10, 20]" stripedRows>
            <template #header>
                <div class="flex flex-wrap items-center justify-between gap-2">
                    <span class="text-xl font-bold">Bible Processing Errors</span>
                    <Button icon="pi pi-refresh" rounded raised @click="loadErrors" />
                </div>
            </template>
            
            <Column field="id" header="ID" sortable style="width: 8%"></Column>
            <Column field="bibleId" header="Bible ID" sortable style="width: 10%"></Column>
            <Column field="bibleName" header="Bible Name" sortable style="width: 25%"></Column>
            <Column field="errorType" header="Error Type" sortable style="width: 15%">
                <template #body="slotProps">
                    <Tag :value="slotProps.data.errorType" 
                         :severity="getErrorSeverity(slotProps.data.errorType)" />
                </template>
            </Column>
            <Column field="message" header="Error Message" style="width: 30%">
                <template #body="slotProps">
                    <div class="max-w-xs truncate" :title="slotProps.data.message">
                        {{ slotProps.data.message }}
                    </div>
                </template>
            </Column>
            <Column field="timestamp" header="Date" sortable style="width: 12%">
                <template #body="slotProps">
                    {{ formatDate(slotProps.data.timestamp) }}
                </template>
            </Column>
            
            <template #footer>
                Total errors: {{ errors ? errors.length : 0 }}
            </template>
        </DataTable>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

// Sample error data
const errors = ref([
    {
        id: 1,
        bibleId: 9,
        bibleName: 'Reina-Valera',
        errorType: 'Parse Error',
        message: 'Invalid XML structure in chapter 12 of Genesis',
        timestamp: new Date('2024-01-15T10:30:00')
    },
    {
        id: 2,
        bibleId: 6,
        bibleName: 'Современный русский перевод',
        errorType: 'Encoding Error',
        message: 'Character encoding mismatch detected in Psalms',
        timestamp: new Date('2024-01-14T15:45:00')
    }
])

const loadErrors = () => {
    // Here you would typically load error data from an API
    console.log('Loading errors...')
}

const getErrorSeverity = (errorType) => {
    switch (errorType) {
        case 'Parse Error':
            return 'danger'
        case 'Encoding Error':
            return 'warn'
        case 'Network Error':
            return 'info'
        case 'Validation Error':
            return 'warn'
        default:
            return 'secondary'
    }
}

const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date)
}

onMounted(() => {
    loadErrors()
})
</script>
