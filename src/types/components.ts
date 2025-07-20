// Component-specific types
export interface BibleItem {
  id: number
  name: string
  language: string
  version: string
  status: 'Active' | 'Inactive' | 'Processing' | 'Error'
}

export interface BibleErrorItem {
  id: number
  bibleId: number
  bibleName: string
  errorType: 'Parse Error' | 'Encoding Error' | 'Network Error' | 'Validation Error'
  message: string
  timestamp: Date
  details?: string
  resolved?: boolean
}

export type StatusSeverity = 'success' | 'warn' | 'danger' | 'secondary' | 'info'
export type ErrorTypeSeverity = 'danger' | 'warn' | 'info' | 'secondary'

// Navigation types
export type ActiveComponent = 'welcome' | 'bible_list' | 'bible_errors'

// Theme types
export interface ThemeState {
  isDarkMode: boolean
}
