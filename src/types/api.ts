// API response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

// Bible related types
export interface Bible {
  id: string
  name: string
  language: string
  version: string
  status: 'active' | 'inactive' | 'processing' | 'error'
  created_at: string
  updated_at: string
  books_count?: number
  chapters_count?: number
  verses_count?: number
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
export interface BibleListParams {
  page?: number
  limit?: number
  status?: Bible['status']
  language?: string
  search?: string
}

export interface ErrorListParams {
  page?: number
  limit?: number
  error_type?: BibleError['error_type']
  resolved?: boolean
  bible_id?: string
}

// Pagination response
export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  pages: number
}
