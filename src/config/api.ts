/**
 * Конфигурация API
 * 
 * API_KEY используется для публичных эндпоинтов (чтение данных)
 * JWT токены используются для административных эндпоинтов (изменение данных)
 */

export const API_CONFIG = {
  // API ключ для публичных эндпоинтов
  // Замените на ваш реальный API ключ
  API_KEY: import.meta.env.VITE_API_KEY || '',
  
  // Базовые URL для API
  BIBLE_API_URL: '/bible-api',
  ALIGNMENT_API_URL: '/alignment-api',
}

/**
 * Публичные эндпоинты, требующие только API ключ
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
 * Административные эндпоинты, требующие JWT токен
 */
export const ADMIN_ENDPOINTS = [
  '/voices/',
  '/anomalies',
  '/manual-fixes',
  '/check_translation',
  '/check_voice',
]

/**
 * Проверить, является ли эндпоинт публичным
 */
export function isPublicEndpoint(url: string): boolean {
  return PUBLIC_ENDPOINTS.some(endpoint => url.includes(endpoint))
}

/**
 * Проверить, является ли эндпоинт административным
 */
export function isAdminEndpoint(url: string): boolean {
  return ADMIN_ENDPOINTS.some(endpoint => url.includes(endpoint))
}
