import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type { 
  ApiResponse, 
  Bible, 
  BibleError, 
  BibleListParams, 
  ErrorListParams, 
  PaginatedResponse 
} from '../types/api'

class ApiService {
  private api: AxiosInstance

  constructor(baseURL: string = 'http://localhost:8000') {
    this.api = axios.create({
      baseURL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('API Request Error:', error)
        return Promise.reject(error)
      }
    )

    // Response interceptor
    this.api.interceptors.response.use(
      (response: AxiosResponse) => {
        console.log(`API Response: ${response.status} ${response.config.url}`)
        return response
      },
      (error) => {
        console.error('API Response Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  // Bible endpoints
  async getBibles(params?: BibleListParams): Promise<PaginatedResponse<Bible>> {
    const response = await this.api.get<PaginatedResponse<Bible>>('/bibles', { params })
    return response.data
  }

  async getBible(id: string): Promise<Bible> {
    const response = await this.api.get<ApiResponse<Bible>>(`/bibles/${id}`)
    return response.data.data
  }

  async createBible(bible: Omit<Bible, 'id' | 'created_at' | 'updated_at'>): Promise<Bible> {
    const response = await this.api.post<ApiResponse<Bible>>('/bibles', bible)
    return response.data.data
  }

  async updateBible(id: string, bible: Partial<Bible>): Promise<Bible> {
    const response = await this.api.put<ApiResponse<Bible>>(`/bibles/${id}`, bible)
    return response.data.data
  }

  async deleteBible(id: string): Promise<void> {
    await this.api.delete(`/bibles/${id}`)
  }

  // Error endpoints
  async getErrors(params?: ErrorListParams): Promise<PaginatedResponse<BibleError>> {
    const response = await this.api.get<PaginatedResponse<BibleError>>('/errors', { params })
    return response.data
  }

  async getError(id: string): Promise<BibleError> {
    const response = await this.api.get<ApiResponse<BibleError>>(`/errors/${id}`)
    return response.data.data
  }

  async resolveError(id: string): Promise<BibleError> {
    const response = await this.api.patch<ApiResponse<BibleError>>(`/errors/${id}/resolve`)
    return response.data.data
  }

  // Health check
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    const response = await this.api.get<{ status: string; timestamp: string }>('/health')
    return response.data
  }
}

// Export singleton instance
export const apiService = new ApiService()
export default apiService
