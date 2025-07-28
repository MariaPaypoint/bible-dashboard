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
  AnomalyStatus,
  ExcerptResponse,
  ExcerptParams,
  CreateAnomalyRequest
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
        if (error.response?.status === 422) {
          console.error('422 Error Details:', {
            status: error.response.status,
            data: error.response.data,
            config: {
              method: error.config?.method,
              url: error.config?.url,
              data: error.config?.data
            }
          })
        }
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
  async updateAnomalyStatus(
    anomalyCode: number, 
    status: AnomalyStatus, 
    begin?: number, 
    end?: number
  ): Promise<VoiceAnomalyModel> {
    const payload: { status: AnomalyStatus; begin?: number; end?: number } = { status }
    
    // Add begin and end parameters for corrected status
    if (status === 'corrected' && begin !== undefined && end !== undefined) {
      payload.begin = begin
      payload.end = end
    }
    
    const response = await this.api.patch<VoiceAnomalyModel>(`/voices/anomalies/${anomalyCode}/status`, payload)
    return response.data
  }

  // Create new anomaly endpoint
  async createAnomaly(anomalyData: CreateAnomalyRequest): Promise<VoiceAnomalyModel> {
    const response = await this.api.post<VoiceAnomalyModel>('/voices/anomalies', anomalyData)
    return response.data
  }

  // Get excerpt with alignment endpoint
  async getExcerptWithAlignment(params: ExcerptParams): Promise<ExcerptResponse> {
    const response = await this.api.get<ExcerptResponse>('/excerpt_with_alignment', { params })
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
