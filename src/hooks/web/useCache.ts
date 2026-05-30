/**
 * 配置浏览器本地存储方式，可直接存储对象和数组。
 */

type CacheType = 'sessionStorage' | 'localStorage'

interface CachePayload<T = unknown> {
  value: T
  expire?: number
}

interface LegacyCachePayload {
  c: number
  e: number
  v: string
}

interface CacheSetOptions {
  exp?: number | string | Date
}

interface CacheStorage {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
}

const CACHE_PREFIX = '__refuse_cache_v1__:'
const CACHE_SECRET = 'refuse-classification-system'

class MemoryStorage implements CacheStorage {
  private cache = new Map<string, string>()

  getItem(key: string) {
    return this.cache.get(key) ?? null
  }

  setItem(key: string, value: string) {
    this.cache.set(key, value)
  }

  removeItem(key: string) {
    this.cache.delete(key)
  }

  clear() {
    this.cache.clear()
  }
}

class WebStorageCache {
  constructor(private readonly storage: CacheStorage) {}

  set<T>(key: string, value: T, options?: CacheSetOptions) {
    if (value === undefined) {
      this.delete(key)
      return value
    }

    const payload: CachePayload<T> = {
      value
    }

    const expire = getExpireTime(options?.exp)

    if (expire) {
      payload.expire = expire
    }

    this.storage.setItem(key, encodeStorageValue(JSON.stringify(payload)))

    return value
  }

  get<T = any>(key: string): T {
    const item = this.storage.getItem(key)

    if (item == null) return null as T

    try {
      const payload = JSON.parse(decodeStorageValue(item)) as CachePayload<T> | LegacyCachePayload | T

      if (!payload || typeof payload !== 'object') {
        return payload as T
      }

      if (isLegacyCachePayload(payload)) {
        if (payload.e <= Date.now()) {
          this.delete(key)
          return null as T
        }

        return JSON.parse(payload.v) as T
      }

      if (!('value' in payload)) return payload as T

      if (payload.expire && payload.expire <= Date.now()) {
        this.delete(key)
        return null as T
      }

      return payload.value
    } catch {
      if (item.startsWith(CACHE_PREFIX)) {
        this.delete(key)
        return null as T
      }

      return item as T
    }
  }

  delete(key: string) {
    this.storage.removeItem(key)
  }

  clear() {
    this.storage.clear()
  }
}

const isLegacyCachePayload = (payload: unknown): payload is LegacyCachePayload => {
  return !!payload && typeof payload === 'object' && 'c' in payload && 'e' in payload && 'v' in payload
}

const getExpireTime = (exp?: CacheSetOptions['exp']) => {
  if (!exp || exp === Infinity) return undefined

  if (typeof exp === 'number') {
    return Date.now() + exp * 1000
  }

  if (exp instanceof Date) {
    return exp.getTime()
  }

  const date = new Date(exp)
  const time = date.getTime()

  return Number.isNaN(time) ? undefined : time
}

const getCacheSecret = () => {
  if (typeof window === 'undefined') return CACHE_SECRET

  return `${CACHE_SECRET}:${window.location.host}`
}

const textToBytes = (value: string) => new TextEncoder().encode(value)

const bytesToText = (bytes: Uint8Array) => new TextDecoder().decode(bytes)

const xorBytes = (bytes: Uint8Array) => {
  const secretBytes = textToBytes(getCacheSecret())
  const transformedBytes = new Uint8Array(bytes.length)

  bytes.forEach((byte, index) => {
    transformedBytes[index] = byte ^ secretBytes[index % secretBytes.length]
  })

  return transformedBytes
}

const bytesToBase64 = (bytes: Uint8Array) => {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('')

  return btoa(binary)
}

const base64ToBytes = (value: string) => {
  return Uint8Array.from(atob(value), (char) => char.charCodeAt(0))
}

const encodeStorageValue = (value: string) => {
  return `${CACHE_PREFIX}${bytesToBase64(xorBytes(textToBytes(value)))}`
}

const decodeStorageValue = (value: string) => {
  if (!value.startsWith(CACHE_PREFIX)) return value

  return bytesToText(xorBytes(base64ToBytes(value.slice(CACHE_PREFIX.length))))
}

const getStorage = (type: CacheType): CacheStorage => {
  if (typeof window === 'undefined') {
    return new MemoryStorage()
  }

  return window[type]
}

export const useCache = (type: CacheType = 'sessionStorage') => {
  const wsCache = new WebStorageCache(getStorage(type))

  return {
    wsCache
  }
}
