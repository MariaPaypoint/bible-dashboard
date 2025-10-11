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
          Войдите для доступа к административным функциям
        </p>
      </div>

      <!-- Login Card -->
      <div class="bg-surface-0 dark:bg-surface-900 rounded-xl shadow-lg border border-surface-200 dark:border-surface-700 p-8">
        <form @submit.prevent="handleLogin" class="space-y-6">
          <!-- Username Field -->
          <div>
            <label for="username" class="block text-sm font-medium text-surface-900 dark:text-surface-0 mb-2">
              Имя пользователя
            </label>
            <InputText
              id="username"
              v-model="username"
              type="text"
              placeholder="Введите имя пользователя"
              class="w-full"
              :class="{ 'p-invalid': error }"
              :disabled="isLoading"
              autocomplete="username"
              required
            />
          </div>

          <!-- Password Field -->
          <div>
            <label for="password" class="block text-sm font-medium text-surface-900 dark:text-surface-0 mb-2">
              Пароль
            </label>
            <Password
              id="password"
              v-model="password"
              placeholder="Введите пароль"
              :feedback="false"
              toggleMask
              class="w-full"
              inputClass="w-full"
              :class="{ 'p-invalid': error }"
              :disabled="isLoading"
              autocomplete="current-password"
              required
            />
          </div>

          <!-- Error Message -->
          <Message v-if="error" severity="error" :closable="false">
            {{ error }}
          </Message>

          <!-- Submit Button -->
          <Button
            type="submit"
            label="Войти"
            icon="pi pi-sign-in"
            class="w-full"
            :loading="isLoading"
            :disabled="!username || !password"
          />
        </form>

        <!-- Skip Login Link -->
        <div class="mt-6 text-center">
          <a
            @click="handleSkip"
            class="text-sm text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 cursor-pointer transition-colors"
          >
            Продолжить без авторизации
          </a>
          <p class="text-xs text-surface-500 dark:text-surface-400 mt-2">
            Доступны только функции просмотра
          </p>
        </div>
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
            {{ isDarkMode ? 'Светлая тема' : 'Темная тема' }}
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

const emit = defineEmits<{
  (e: 'login-success'): void
  (e: 'skip-login'): void
}>()

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
    emit('login-success')
  }
}

const handleSkip = () => {
  emit('skip-login')
}

const toggleTheme = () => {
  document.documentElement.classList.toggle('dark')
  isDarkMode.value = document.documentElement.classList.contains('dark')
}
</script>

<style scoped>
/* Дополнительные стили для Password компонента */
:deep(.p-password) {
  width: 100%;
}

:deep(.p-password input) {
  width: 100%;
}
</style>
