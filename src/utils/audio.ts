import { API_CONFIG } from '../config/api'

/**
 * Создает URL с API ключом для аудио файлов
 * Поскольку HTML Audio элемент не поддерживает кастомные заголовки,
 * добавляем API ключ как query параметр
 * 
 * ПРИМЕЧАНИЕ: Это работает только если API поддерживает API ключ в query параметрах
 */
export function createAudioUrlWithAuth(url: string): string {
  if (!url) return url
  
  // Если API ключ не настроен, возвращаем URL как есть
  if (!API_CONFIG.API_KEY) {
    console.warn('API_KEY не настроен. Аудио может не загрузиться.')
    return url
  }
  
  // Проверяем, является ли это аудио URL
  if (!url.includes('/audio/')) {
    return url
  }
  
  // Добавляем API ключ как query параметр
  const separator = url.includes('?') ? '&' : '?'
  return `${url}${separator}api_key=${encodeURIComponent(API_CONFIG.API_KEY)}`
}

/**
 * Выполняет fetch запрос с API ключом в заголовке
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const headers = new Headers(options.headers)
  
  // Добавляем API ключ для публичных эндпоинтов
  if (API_CONFIG.API_KEY && url.includes('/audio/')) {
    headers.set('X-API-Key', API_CONFIG.API_KEY)
  }
  
  return fetch(url, {
    ...options,
    headers
  })
}

/**
 * Загружает аудио файл с авторизацией и создает Blob URL
 * 
 * ВНИМАНИЕ: Это временное решение с недостатками:
 * - Загружает весь файл в память
 * - Не работает стриминг
 * - Большое потребление памяти
 * 
 * Используйте только если API не поддерживает API ключ в query параметрах
 */
export async function createAuthenticatedAudioBlob(url: string): Promise<string> {
  if (!API_CONFIG.API_KEY) {
    console.warn('API_KEY не настроен. Возвращаем оригинальный URL.')
    return url
  }
  
  try {
    const response = await fetchWithAuth(url)
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    
    const blob = await response.blob()
    const blobUrl = URL.createObjectURL(blob)
    
    return blobUrl
  } catch (error) {
    console.error('Ошибка загрузки аудио с авторизацией:', error)
    throw error
  }
}

/**
 * Очищает Blob URL для освобождения памяти
 */
export function revokeBlobUrl(blobUrl: string): void {
  if (blobUrl.startsWith('blob:')) {
    URL.revokeObjectURL(blobUrl)
  }
}
