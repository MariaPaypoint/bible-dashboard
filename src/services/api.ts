import axios, { type AxiosInstance, type AxiosResponse } from 'axios'
import type { 
  TranslationModel,
  LanguageModel,
  BookModel,
  TranslationListParams,
  VoiceAnomalyModel,
  VoiceAnomalyListParams,
  VoiceAnomaliesResponse,
  BibleError, 
  ErrorListParams, 
  PaginatedResponse,
  AnomalyStatus 
} from '../types/api'

class ApiService {
  private api: AxiosInstance

  constructor(baseURL: string = '/api') {
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
        // API Request logging removed
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
        // API Response logging removed
        return response
      },
      (error) => {
        console.error('API Response Error:', error.response?.data || error.message)
        return Promise.reject(error)
      }
    )
  }

  // Translation endpoints
  async getTranslations(params?: TranslationListParams): Promise<TranslationModel[]> {
    const response = await this.api.get<TranslationModel[]>('/translations', { params })
    return response.data
  }

  // Languages endpoint
  async getLanguages(): Promise<LanguageModel[]> {
    const response = await this.api.get<LanguageModel[]>('/languages')
    return response.data
  }

  // Books endpoint
  async getTranslationBooks(translationCode: number, voiceCode?: number): Promise<BookModel[]> {
    const params = voiceCode ? { voice_code: voiceCode } : {}
    const response = await this.api.get<BookModel[]>(`/translations/${translationCode}/books`, { params })
    return response.data
  }

  // Voice anomalies endpoint
  async getVoiceAnomalies(voiceCode: number, params?: VoiceAnomalyListParams): Promise<VoiceAnomaliesResponse> {
    const response = await this.api.get<VoiceAnomaliesResponse>(`/voices/${voiceCode}/anomalies`, { params })
    return response.data
  }

  // Update voice endpoint
  async updateVoice(voiceCode: number, data: { active: boolean }): Promise<any> {
    const response = await this.api.put(`/voices/${voiceCode}`, data)
    return response.data
  }

  // Update anomaly status endpoint
  async updateAnomalyStatus(anomalyCode: number, status: AnomalyStatus): Promise<VoiceAnomalyModel> {
    const response = await this.api.patch<VoiceAnomalyModel>(`/voices/anomalies/${anomalyCode}/status`, { status })
    return response.data
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
