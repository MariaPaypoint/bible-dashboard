import { ref, computed } from 'vue'
import { authService, type LoginCredentials } from '../services/auth'

export function useAuth() {
  const isAuthenticated = ref(authService.isAuthenticated())
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    isLoading.value = true
    error.value = null

    try {
      await authService.login(credentials)
      isAuthenticated.value = true
      return true
    } catch (err: any) {
      error.value = err.message || 'Ошибка авторизации'
      isAuthenticated.value = false
      return false
    } finally {
      isLoading.value = false
    }
  }

  const logout = () => {
    authService.logout()
    isAuthenticated.value = false
  }

  const checkAuth = () => {
    isAuthenticated.value = authService.isAuthenticated()
  }

  return {
    isAuthenticated: computed(() => isAuthenticated.value),
    isLoading: computed(() => isLoading.value),
    error: computed(() => error.value),
    login,
    logout,
    checkAuth
  }
}
