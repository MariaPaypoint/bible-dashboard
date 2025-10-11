import axios from 'axios'

export interface LoginCredentials {
  username: string
  password: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface AuthState {
  token: string | null
  isAuthenticated: boolean
}

class AuthService {
  private readonly TOKEN_KEY = 'auth_token'
  private readonly TOKEN_EXPIRY_KEY = 'auth_token_expiry'

  /**
   * Получить сохраненный токен из localStorage
   */
  getToken(): string | null {
    const token = localStorage.getItem(this.TOKEN_KEY)
    const expiry = localStorage.getItem(this.TOKEN_EXPIRY_KEY)

    if (!token || !expiry) {
      return null
    }

    // Проверяем, не истек ли токен
    if (Date.now() > parseInt(expiry)) {
      this.clearToken()
      return null
    }

    return token
  }

  /**
   * Сохранить токен в localStorage
   */
  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token)
    // Токен действителен 24 часа
    const expiry = Date.now() + 24 * 60 * 60 * 1000
    localStorage.setItem(this.TOKEN_EXPIRY_KEY, expiry.toString())
  }

  /**
   * Удалить токен из localStorage
   */
  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY)
    localStorage.removeItem(this.TOKEN_EXPIRY_KEY)
  }

  /**
   * Проверить, авторизован ли пользователь
   */
  isAuthenticated(): boolean {
    return this.getToken() !== null
  }

  /**
   * Авторизация пользователя
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        '/bible-api/auth/login',
        credentials,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      // Сохраняем токен
      this.setToken(response.data.access_token)

      return response.data
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Неверное имя пользователя или пароль')
      }
      throw new Error(error.response?.data?.detail || 'Ошибка авторизации')
    }
  }

  /**
   * Выход из системы
   */
  logout(): void {
    this.clearToken()
  }

  /**
   * Получить заголовок авторизации для запросов
   */
  getAuthHeader(): string | null {
    const token = this.getToken()
    return token ? `Bearer ${token}` : null
  }
}

export const authService = new AuthService()
export default authService
