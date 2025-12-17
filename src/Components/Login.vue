<template>
  <div class="min-h-screen flex items-center justify-center bg-surface-50 dark:bg-surface-950 p-4">
    <div class="w-full max-w-md">
      <!-- Logo and Title -->
      <div class="text-center mb-8">
        <div class="flex justify-center mb-4">
          <img src="@/assets/logo.png" alt="Logo" width="64" height="64" />
        </div>
        <h1 class="text-3xl font-bold text-surface-900 dark:text-surface-0 mb-2">
          Forced Alignments
        </h1>
        <p class="text-surface-600 dark:text-surface-400">
          Log in to access administrative functions
        </p>
      </div>

      <!-- Login Card -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700 p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Username Field -->
          <div>
            <label for="username" class="block text-sm font-medium text-surface-900 dark:text-surface-0 mb-2">
              Username
            </label>
            <InputText
              id="username"
              v-model="username"
              type="text"
              placeholder="Enter username"
              class="w-full"
              :class="{ 'p-invalid': error }"
              :disabled="isLoading"
              autocomplete="username"
              required
              data-testid="username-input"
            />
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-surface-900 dark:text-surface-0 mb-2">
              Password
            </label>
            <Password
              id="password"
              v-model="password"
              placeholder="Enter password"
              :feedback="false"
              toggleMask
              class="w-full"
              inputClass="w-full"
              :class="{ 'p-invalid': error }"
              :disabled="isLoading"
              autocomplete="current-password"
              required
              data-testid="password-input"
            />
          </div>

          <!-- Error Message -->
          <Message v-if="error" severity="error" :closable="false">
            {{ error }}
          </Message>

          <!-- Submit Button -->
          <Button
            type="submit"
            label="Login"
            icon="pi pi-sign-in"
            class="w-full"
            :loading="isLoading"
            :disabled="!username || !password"
            data-testid="login-submit-button"
          />
        </form>

      </div>

      <!-- Theme Toggle -->
      <div class="mt-6 flex justify-center">
        <button
          @click="toggleTheme"
          type="button"
          class="flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors text-surface-700 dark:text-surface-200"
        >
          <component :is="isDarkMode ? Sun : Moon" class="w-5 h-5" />
          <span class="text-sm font-medium">
            {{ isDarkMode ? 'Light theme' : 'Dark theme' }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import InputText from 'primevue/inputtext'
import Password from 'primevue/password'
import Button from 'primevue/button'
import Message from 'primevue/message'
import { Sun, Moon } from 'lucide-vue-next'
import { useAuth } from '../composables/useAuth'

import { useRouter } from 'vue-router'

const router = useRouter()

const { login, isLoading, error } = useAuth()

const username = ref('')
const password = ref('')
const isDarkMode = ref(false)

onMounted(() => {
  isDarkMode.value = document.documentElement.classList.contains('dark')
})

const handleLogin = async () => {
  const success = await login({
    username: username.value,
    password: password.value
  })

  if (success) {
    router.push('/')
  }
}


const toggleTheme = () => {
  document.documentElement.classList.toggle('dark')
  isDarkMode.value = document.documentElement.classList.contains('dark')
}
</script>

<style scoped>
/* Additional styles for Password component */
:deep(.p-password) {
  width: 100%;
}

:deep(.p-password input) {
  width: 100%;
}
</style>
