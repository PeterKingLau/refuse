import { addIcon, type IconifyIcon } from 'iconify-icon'

export interface LocalIconSet {
  name: string
  prefix: string
  icons: string[]
}

interface IconifySearchResponse {
  icons?: string[]
}

interface IconifyCollection {
  prefix: string
  icons: Record<string, IconifyIcon>
  width?: number
  height?: number
}

interface PublicIconSetFile {
  name: string
  prefix?: string
  path: string
}

interface LocalCachePayload<T> {
  version: number
  expire: number
  value: T
}

const iconAliasMap: Record<string, string> = {
  'ant-design:line-chart-outlined': 'mdi:chart-line'
}

const fallbackPublicIconSetFiles: PublicIconSetFile[] = [
  { name: 'Ant Design Outlined', prefix: 'ant-design', path: 'ant-design-icons.json' },
  { name: 'Element Plus', prefix: 'ep', path: 'ep-icons.json' },
  { name: 'Material Design', prefix: 'mdi', path: 'mdi-icons.json' },
  { name: 'Material Symbols', prefix: 'material-symbols', path: 'material-symbols-icons.json' },
  { name: 'Simple Icons', prefix: 'simple-icons', path: 'simple-icons-icons.json' }
]

const ICON_CACHE_VERSION = 1
const ICON_CACHE_PREFIX = 'refuse-iconify:'
const ICON_SET_CACHE_TTL = 7 * 24 * 60 * 60 * 1000
const REMOTE_SEARCH_CACHE_TTL = 24 * 60 * 60 * 1000
const ICON_LOCAL_CACHE_LIMIT = 80

const iconCollectionMap = new Map<string, IconifyCollection>()
const iconCollectionLoadingMap = new Map<string, Promise<LocalIconSet | undefined>>()
const remoteIconSearchLoadingMap = new Map<string, Promise<string[]>>()
let cachedIconSets: LocalIconSet[] | undefined
let iconSetsLoading: Promise<LocalIconSet[]> | undefined
let cachedPublicIconSetFiles: PublicIconSetFile[] | undefined
let publicIconSetFilesLoading: Promise<PublicIconSetFile[]> | undefined

const isClient = () => typeof window !== 'undefined'

const getPublicIconUrl = (fileName: string) => {
  const baseUrl = import.meta.env.BASE_URL || '/'
  return `${baseUrl.replace(/\/?$/, '/')}iconify/${fileName}`
}

const getCacheKey = (key: string) => `${ICON_CACHE_PREFIX}${key}`

const getLocalCacheEntries = () => {
  if (!isClient()) return []

  return Array.from({ length: window.localStorage.length }, (_, index) => window.localStorage.key(index))
    .filter((key): key is string => !!key && key.startsWith(ICON_CACHE_PREFIX))
    .map((key) => {
      try {
        const cached = window.localStorage.getItem(key)
        if (!cached) return undefined

        const payload = JSON.parse(cached) as LocalCachePayload<unknown>
        return {
          key,
          expire: payload.expire
        }
      } catch {
        window.localStorage.removeItem(key)
        return undefined
      }
    })
    .filter(Boolean) as Array<{ key: string; expire: number }>
}

const pruneLocalCache = (reserveCount = 0) => {
  if (!isClient()) return

  const now = Date.now()
  const entries = getLocalCacheEntries().filter((entry) => {
    if (entry.expire > now) return true
    window.localStorage.removeItem(entry.key)
    return false
  })

  const overflowCount = entries.length + reserveCount - ICON_LOCAL_CACHE_LIMIT
  if (overflowCount <= 0) return

  entries
    .sort((a, b) => a.expire - b.expire)
    .slice(0, overflowCount)
    .forEach((entry) => {
      window.localStorage.removeItem(entry.key)
    })
}

const getLocalCache = <T>(key: string): T | undefined => {
  if (!isClient()) return undefined

  try {
    const cached = window.localStorage.getItem(getCacheKey(key))
    if (!cached) return undefined

    const payload = JSON.parse(cached) as LocalCachePayload<T>

    if (!payload || payload.version !== ICON_CACHE_VERSION || payload.expire <= Date.now()) {
      window.localStorage.removeItem(getCacheKey(key))
      return undefined
    }

    return payload.value
  } catch {
    window.localStorage.removeItem(getCacheKey(key))
    return undefined
  }
}

const setLocalCache = <T>(key: string, value: T, ttl = ICON_SET_CACHE_TTL) => {
  if (!isClient()) return

  const payload: LocalCachePayload<T> = {
    version: ICON_CACHE_VERSION,
    expire: Date.now() + ttl,
    value
  }

  try {
    window.localStorage.setItem(getCacheKey(key), JSON.stringify(payload))
  } catch {
    pruneLocalCache(1)
    try {
      window.localStorage.setItem(getCacheKey(key), JSON.stringify(payload))
    } catch {
      // Storage can be unavailable or full. Memory cache still prevents repeated requests.
    }
  }
}

const loadPublicIconSetFiles = async () => {
  pruneLocalCache()

  if (cachedPublicIconSetFiles) return cachedPublicIconSetFiles
  if (publicIconSetFilesLoading) return publicIconSetFilesLoading

  const cachedFiles = getLocalCache<PublicIconSetFile[]>('icon-set-files')
  if (cachedFiles?.length) {
    cachedPublicIconSetFiles = cachedFiles
    return cachedFiles
  }

  publicIconSetFilesLoading = fetch(getPublicIconUrl('icon-sets.json'))
    .then(async (response) => {
      if (!response.ok) return fallbackPublicIconSetFiles

      const files = (await response.json()) as PublicIconSetFile[]
      const validFiles = files.filter((file) => file.name && file.path)
      return validFiles.length ? validFiles : fallbackPublicIconSetFiles
    })
    .then((files) => {
      cachedPublicIconSetFiles = files
      setLocalCache('icon-set-files', files)
      return files
    })
    .catch(() => fallbackPublicIconSetFiles)
    .finally(() => {
      publicIconSetFilesLoading = undefined
    })

  return publicIconSetFilesLoading
}

export const normalizeIconName = (icon?: string) => {
  if (!icon) return ''
  return iconAliasMap[icon] || icon
}

const loadPublicIconSet = async (file: PublicIconSetFile): Promise<LocalIconSet | undefined> => {
  const cachedCollection = getLocalCache<IconifyCollection>(`collection:${file.path}`)

  if (cachedCollection?.prefix && cachedCollection.icons) {
    iconCollectionMap.set(cachedCollection.prefix, cachedCollection)
    return {
      name: file.name,
      prefix: cachedCollection.prefix,
      icons: Object.keys(cachedCollection.icons)
    }
  }

  const loadingCollection = iconCollectionLoadingMap.get(file.path)
  if (loadingCollection) return loadingCollection

  const promise = fetch(getPublicIconUrl(file.path))
    .then(async (response) => {
      if (!response.ok) return undefined

      const collection = (await response.json()) as IconifyCollection
      if (!collection.prefix || !collection.icons) return undefined

      iconCollectionMap.set(collection.prefix, collection)
      setLocalCache(`collection:${file.path}`, collection)

      return {
        name: file.name,
        prefix: collection.prefix,
        icons: Object.keys(collection.icons)
      }
    })
    .catch(() => undefined)
    .finally(() => {
      iconCollectionLoadingMap.delete(file.path)
    })

  iconCollectionLoadingMap.set(file.path, promise)
  return promise
}

export const loadLocalIconSets = async () => {
  if (cachedIconSets) return cachedIconSets
  if (iconSetsLoading) return iconSetsLoading

  iconSetsLoading = loadPublicIconSetFiles()
    .then(async (publicIconSetFiles) => {
      cachedIconSets = (await Promise.all(publicIconSetFiles.map(loadPublicIconSet))).filter(Boolean) as LocalIconSet[]
      return cachedIconSets
    })
    .finally(() => {
      iconSetsLoading = undefined
    })

  return iconSetsLoading
}

export const registerIconNames = (iconNames: string[]) => {
  iconNames.forEach((iconName) => {
    const normalizedIconName = normalizeIconName(iconName)
    const [prefix, name] = normalizedIconName.split(':')
    if (!prefix || !name) return

    const collection = iconCollectionMap.get(prefix)
    const icon = collection?.icons?.[name]
    if (!collection || !icon) return

    addIcon(normalizedIconName, {
      width: collection.width || 24,
      height: collection.height || 24,
      ...icon
    })
  })
}

export const searchRemoteIconNames = async (keyword: string, limit = 120) => {
  const query = keyword.trim()
  if (!query) return []

  const cacheKey = `remote-search:${limit}:${query.toLowerCase()}`
  const cachedResult = getLocalCache<string[]>(cacheKey)
  if (cachedResult) return cachedResult

  const loadingSearch = remoteIconSearchLoadingMap.get(cacheKey)
  if (loadingSearch) return loadingSearch

  const promise = fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=${limit}`)
    .then(async (response) => {
      if (!response.ok) return []

      const data = (await response.json()) as IconifySearchResponse
      const icons = (data.icons || []).map(normalizeIconName)
      setLocalCache(cacheKey, icons, REMOTE_SEARCH_CACHE_TTL)
      return icons
    })
    .catch(() => [])
    .finally(() => {
      remoteIconSearchLoadingMap.delete(cacheKey)
    })

  remoteIconSearchLoadingMap.set(cacheKey, promise)
  return promise
}
