/**
 * 配置浏览器本地存储方式，可直接存储对象和数组。
 */

type CacheType = 'sessionStorage' | 'localStorage'

interface CachePayload<T = unknown> {
  value: T
  created?: number
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
  readonly length?: number
  getItem(key: string): string | null
  key?(index: number): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
  clear(): void
}

const CACHE_PREFIX = '__refuse_cache_v1__:'
const CACHE_SECRET = 'refuse-classification-system'
const CACHE_MAX_ENTRIES = 160

interface CacheEntryMeta {
  key: string
  created: number
  expire?: number
}

class MemoryStorage implements CacheStorage {
  private cache = new Map<string, string>()

  get length() {
    return this.cache.size
  }

  getItem(key: string) {
    return this.cache.get(key) ?? null
  }

  key(index: number) {
    return Array.from(this.cache.keys())[index] ?? null
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
  constructor(private readonly storage: CacheStorage) {
    this.pruneExpired()
  }

  set<T>(key: string, value: T, options?: CacheSetOptions) {
    if (value === undefined) {
      this.delete(key)
      return value
    }

    const payload: CachePayload<T> = {
      created: Date.now(),
      value
    }

    const expire = getExpireTime(options?.exp)

    if (expire) {
      payload.expire = expire
    }

    const storageValue = encodeStorageValue(JSON.stringify(payload))

    try {
      this.storage.setItem(key, storageValue)
    } catch {
      this.pruneExpired()
      this.pruneOverflow(1)
      this.storage.setItem(key, storageValue)
    }

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

        const value = JSON.parse(payload.v) as T
        try {
          this.storage.setItem(
            key,
            encodeStorageValue(
              JSON.stringify({
                created: payload.c,
                expire: payload.e,
                value
              })
            )
          )
        } catch {
          // Keep returning the legacy value even if migration cannot be written.
        }
        return value
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
    getStorageKeys(this.storage).forEach((key) => {
      const item = this.storage.getItem(key)
      if (item?.startsWith(CACHE_PREFIX) || isLegacyCacheStorageValue(item)) {
        this.storage.removeItem(key)
      }
    })
  }

  pruneExpired() {
    const now = Date.now()

    getStorageKeys(this.storage).forEach((key) => {
      const meta = getCacheEntryMeta(this.storage, key)
      if (meta?.expire && meta.expire <= now) {
        this.storage.removeItem(key)
      }
    })
  }

  private pruneOverflow(reservedEntries = 0) {
    const entries = getStorageKeys(this.storage)
      .map((key) => getCacheEntryMeta(this.storage, key))
      .filter(Boolean) as CacheEntryMeta[]

    const overflowCount = entries.length + reservedEntries - CACHE_MAX_ENTRIES
    if (overflowCount <= 0) return

    entries
      .sort((a, b) => {
        const expireDiff = (a.expire ?? Number.MAX_SAFE_INTEGER) - (b.expire ?? Number.MAX_SAFE_INTEGER)
        return expireDiff || a.created - b.created
      })
      .slice(0, overflowCount)
      .forEach((entry) => {
        this.storage.removeItem(entry.key)
      })
  }
}

const isLegacyCachePayload = (payload: unknown): payload is LegacyCachePayload => {
  return !!payload && typeof payload === 'object' && 'c' in payload && 'e' in payload && 'v' in payload
}

const isLegacyCacheStorageValue = (value: string | null) => {
  if (!value) return false

  try {
    return isLegacyCachePayload(JSON.parse(value))
  } catch {
    return false
  }
}

const getStorageKeys = (storage: CacheStorage) => {
  if (!storage.key || typeof storage.length !== 'number') return []

  return Array.from({ length: storage.length }, (_, index) => storage.key?.(index)).filter(Boolean) as string[]
}

const getCacheEntryMeta = (storage: CacheStorage, key: string): CacheEntryMeta | undefined => {
  const item = storage.getItem(key)

  if (!item?.startsWith(CACHE_PREFIX)) return undefined

  try {
    const payload = JSON.parse(decodeStorageValue(item)) as CachePayload
    if (!payload || typeof payload !== 'object' || !('value' in payload)) return undefined

    return {
      key,
      created: payload.created || 0,
      expire: payload.expire
    }
  } catch {
    storage.removeItem(key)
    return undefined
  }
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

const cacheInstanceMap = new Map<CacheType, WebStorageCache>()

export const useCache = (type: CacheType = 'sessionStorage') => {
  const cachedInstance = cacheInstanceMap.get(type)
  const wsCache = cachedInstance || new WebStorageCache(getStorage(type))

  if (!cachedInstance) {
    cacheInstanceMap.set(type, wsCache)
  }

  return {
    wsCache
  }
}
