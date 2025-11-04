/**
 * API Configuration
 * 
 * API_KEY is used for public endpoints (reading data)
 * JWT tokens are used for administrative endpoints (modifying data)
 */

export const API_CONFIG = {
  // API key for public Bible API endpoints
  // Replace with your actual API key
  API_KEY: import.meta.env.VITE_BIBLE_API_KEY || '',
  
  // Base URLs for APIs
  BIBLE_API_URL: '/bible-api',
  ALIGNMENT_API_URL: '/alignment-api',
}

/**
 * Public endpoints requiring only API key
 */
export const PUBLIC_ENDPOINTS = [
  '/languages',
  '/translations',
  '/translation_info',
  '/books',
  '/chapter_with_alignment',
  '/excerpt_with_alignment',
  '/audio/',
]

/**
 * Administrative endpoints requiring JWT token
 */
export const ADMIN_ENDPOINTS = [
  '/voices/',
  '/anomalies',
  '/manual-fixes',
  '/check_translation',
  '/check_voice',
]

/**
 * Check if endpoint is public
 */
export function isPublicEndpoint(url: string): boolean {
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint))
}

/**
 * Check if endpoint is administrative
 */
export function isAdminEndpoint(url: string): boolean {
  return ADMIN_ENDPOINTS.some(endpoint => url.includes(endpoint))
}
