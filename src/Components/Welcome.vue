<template>
    <div class="flex flex-col items-center justify-center h-full text-center p-8">
        <div class="mb-8">
            <i class="pi pi-book text-6xl text-cyan-500 mb-4"></i>
            <h2 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-4">
                Welcome to Bible Dashboard
            </h2>
            <p class="text-lg text-surface-600 dark:text-surface-400 max-w-2xl">
                Manage and monitor your Bible forced alignments with ease. 
                Use the menu on the left to navigate through different sections.
            </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            <div class="bg-surface-100 dark:bg-surface-800 p-6 rounded-lg">
                <i class="pi pi-list text-2xl text-cyan-500 mb-3"></i>
                <h3 class="text-xl font-semibold mb-2 text-surface-900 dark:text-surface-0">Bible List</h3>
                <p class="text-surface-600 dark:text-surface-400">
                    View and manage all available Bible translations and versions.
                </p>
            </div>
            
            <div class="bg-surface-100 dark:bg-surface-800 p-6 rounded-lg">
                <i class="pi pi-exclamation-triangle text-2xl text-orange-500 mb-3"></i>
                <h3 class="text-xl font-semibold mb-2 text-surface-900 dark:text-surface-0">Error Monitoring</h3>
                <p class="text-surface-600 dark:text-surface-400">
                    Track and resolve processing errors in your Bible alignments.
                </p>
            </div>
        </div>
    </div>
</template>

<script setup>
// No specific logic needed for welcome component
</script>
