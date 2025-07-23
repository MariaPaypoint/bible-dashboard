// Voice model from API
export interface VoiceModel {
  code: number
  alias: string
  name: string
  description: string | null
  is_music: boolean
  active: boolean
  anomalies_count: number
}

// Translation model from API
export interface TranslationModel {
  code: number
  alias: string
  name: string
  description: string | null
  language: string
  voices: VoiceModel[]
  active: boolean
}

// Language model from API
export interface LanguageModel {
  alias: string
  name_en: string
  name_national: string
}

// Book model from API
export interface BookModel {
  code: number
  book_number: number
  name: string
  alias: string
  chapters_count: number
  anomalies_count?: number
}

// Voice anomaly status types
export type AnomalyStatus = 'detected' | 'confirmed' | 'disproved' | 'corrected'

// Voice anomaly model from API
export interface VoiceAnomalyModel {
  code: number
  voice: number
  translation: number
  book_number: number
  chapter_number: number
  verse_number: number | null
  anomaly_type: string
  word: string
  position_in_verse: number | null
  position_from_end: number | null
  duration: number
  speed: number
  ratio: number
  verse_start_time: number
  verse_end_time: number
  verse_text: string
  status: AnomalyStatus
}

// API response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

export interface BibleError {
  id: string
  bible_id: string
  bible_name?: string
  error_type: 'parsing' | 'validation' | 'processing' | 'network'
  message: string
  details?: string
  created_at: string
  resolved: boolean
}

// API endpoints types
export interface TranslationListParams {
  language?: string
  only_active?: number // 0 or 1
}

export interface VoiceAnomalyListParams {
  page?: number
  limit?: number
  anomaly_type?: string
  book_number?: number
  status?: AnomalyStatus
  sort_by?: 'address' | 'type' | 'ratio'
  sort_order?: 'asc' | 'desc'
}

export interface ErrorListParams {
  page?: number
  limit?: number
  error_type?: BibleError['error_type']
  resolved?: boolean
  bible_id?: string
}

// Voice anomalies response
export interface VoiceAnomaliesResponse {
  items: VoiceAnomalyModel[]
  total_count: number
}

// Pagination response
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}
