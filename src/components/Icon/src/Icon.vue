<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue'
import { addIcon, getIcon, loadIcon, type IconifyIcon } from 'iconify-icon'
import { propTypes } from '@/utils/propTypes'
import 'iconify-icon'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('icon')
const ICON_CACHE_PREFIX = 'refuse-iconify-cache:'
const ICON_CACHE_VERSION = 1
const ICON_CACHE_TTL = 7 * 24 * 60 * 60 * 1000
const ICON_MEMORY_CACHE_LIMIT = 300
const ICON_STORAGE_CACHE_LIMIT = 300

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

interface IconStoragePayload {
  version: number
  created: number
  expire: number
  value: Required<IconifyIcon>
}

const ICON_ALIAS_MAP: Record<string, string> = {
  'ant-design:line-chart-outlined': 'mdi:chart-line'
}

const fallbackPublicIconSetFiles: PublicIconSetFile[] = [
  { name: 'Ant Design Outlined', prefix: 'ant-design', path: 'ant-design-icons.json' },
  { name: 'Element Plus', prefix: 'ep', path: 'ep-icons.json' },
  { name: 'Material Design', prefix: 'mdi', path: 'mdi-icons.json' },
  { name: 'Material Symbols', prefix: 'material-symbols', path: 'material-symbols-icons.json' },
  { name: 'Simple Icons', prefix: 'simple-icons', path: 'simple-icons-icons.json' }
]

const iconMemoryCache = new Map<string, Required<IconifyIcon> | null>()
const loadingIconMap = new Map<string, Promise<Required<IconifyIcon> | null>>()
const iconCollectionCache = new Map<string, IconifyCollection | null>()
const iconCollectionLoadingMap = new Map<string, Promise<IconifyCollection | null>>()
let publicIconSetFileMap: Map<string, string> | undefined
let publicIconSetFilesLoading: Promise<Map<string, string>> | undefined

const isClient = () => typeof window !== 'undefined'

const normalizeIconName = (icon: string) => ICON_ALIAS_MAP[icon] || icon

const getPublicIconUrl = (fileName: string) => {
  const baseUrl = import.meta.env.BASE_URL || '/'
  return `${baseUrl.replace(/\/?$/, '/')}iconify/${fileName}`
}

const loadIconSetFileMap = async () => {
  if (publicIconSetFileMap) return publicIconSetFileMap
  if (publicIconSetFilesLoading) return publicIconSetFilesLoading

  publicIconSetFilesLoading = fetch(getPublicIconUrl('icon-sets.json'))
    .then((response) => {
      if (!response.ok) return fallbackPublicIconSetFiles
      return response.json() as Promise<PublicIconSetFile[]>
    })
    .then((files) => {
      const fileMap = new Map<string, string>()
      files.forEach((file) => {
        const prefix = file.prefix || file.path.replace(/-icons\.json$/, '')
        if (prefix) fileMap.set(prefix, file.path)
      })
      publicIconSetFileMap = fileMap
      return fileMap
    })
    .catch(() => {
      const fileMap = new Map<string, string>()
      fallbackPublicIconSetFiles.forEach((file) => {
        const prefix = file.prefix || file.path.replace(/-icons\.json$/, '')
        if (prefix) fileMap.set(prefix, file.path)
      })
      publicIconSetFileMap = fileMap
      return fileMap
    })
    .finally(() => {
      publicIconSetFilesLoading = undefined
    })

  return publicIconSetFilesLoading
}

const getCacheKey = (icon: string) => `${ICON_CACHE_PREFIX}${icon}`

const isIconStoragePayload = (value: unknown): value is IconStoragePayload => {
  return !!value && typeof value === 'object' && 'version' in value && 'expire' in value && 'value' in value
}

const setIconMemoryCache = (icon: string, data: Required<IconifyIcon> | null) => {
  if (iconMemoryCache.has(icon)) {
    iconMemoryCache.delete(icon)
  }

  iconMemoryCache.set(icon, data)

  while (iconMemoryCache.size > ICON_MEMORY_CACHE_LIMIT) {
    const oldestIcon = iconMemoryCache.keys().next().value
    if (!oldestIcon) break
    iconMemoryCache.delete(oldestIcon)
  }
}

const getStoredIconEntries = () => {
  if (!isClient()) return []

  return Array.from({ length: window.localStorage.length }, (_, index) => window.localStorage.key(index))
    .filter((key): key is string => !!key && key.startsWith(ICON_CACHE_PREFIX))
    .map((key) => {
      try {
        const cached = window.localStorage.getItem(key)
        if (!cached) return undefined

        const parsed = JSON.parse(cached) as IconStoragePayload | Required<IconifyIcon>
        if (!isIconStoragePayload(parsed)) {
          return {
            key,
            created: 0,
            expire: Number.MAX_SAFE_INTEGER
          }
        }

        return {
          key,
          created: parsed.created,
          expire: parsed.expire
        }
      } catch {
        window.localStorage.removeItem(key)
        return undefined
      }
    })
    .filter(Boolean) as Array<{ key: string; created: number; expire: number }>
}

const pruneStoredIconCache = (reserveCount = 0) => {
  if (!isClient()) return

  const now = Date.now()
  const entries = getStoredIconEntries().filter((entry) => {
    if (entry.expire > now) return true
    window.localStorage.removeItem(entry.key)
    return false
  })

  const overflowCount = entries.length + reserveCount - ICON_STORAGE_CACHE_LIMIT
  if (overflowCount <= 0) return

  entries
    .sort((a, b) => a.expire - b.expire || a.created - b.created)
    .slice(0, overflowCount)
    .forEach((entry) => {
      window.localStorage.removeItem(entry.key)
    })
}

const loadLocalIconCollection = async (prefix: string) => {
  const cachedCollection = iconCollectionCache.get(prefix)
  if (cachedCollection !== undefined) return cachedCollection

  const loadingCollection = iconCollectionLoadingMap.get(prefix)
  if (loadingCollection) return loadingCollection

  if (!isClient()) return null

  const fileMap = await loadIconSetFileMap()
  const fileName = fileMap.get(prefix)
  if (!fileName) return null

  const promise = fetch(getPublicIconUrl(fileName))
    .then((response) => {
      if (!response.ok) return null
      return response.json() as Promise<IconifyCollection>
    })
    .then((collection) => {
      iconCollectionCache.set(prefix, collection)
      return collection
    })
    .catch(() => {
      iconCollectionCache.set(prefix, null)
      return null
    })
    .finally(() => {
      iconCollectionLoadingMap.delete(prefix)
    })

  iconCollectionLoadingMap.set(prefix, promise)
  return promise
}

const loadLocalIcon = async (icon: string) => {
  const [prefix, name] = icon.split(':')
  if (!prefix || !name) return null

  const collection = await loadLocalIconCollection(prefix)
  const iconData = collection?.icons?.[name]
  if (!collection || !iconData) return null

  return {
    width: collection.width || 24,
    height: collection.height || 24,
    ...iconData
  } as Required<IconifyIcon>
}

const restoreIconFromCache = (icon: string) => {
  if (!isClient()) return undefined

  const cachedIcon = iconMemoryCache.get(icon)
  if (cachedIcon !== undefined) return cachedIcon

  const iconifyIcon = getIcon(icon)
  if (iconifyIcon) {
    setIconMemoryCache(icon, iconifyIcon)
    return iconifyIcon
  }

  try {
    const cached = window.localStorage.getItem(getCacheKey(icon))
    if (!cached) return undefined

    const parsed = JSON.parse(cached) as IconStoragePayload | Required<IconifyIcon>
    const cachedIcon = isIconStoragePayload(parsed) ? parsed.value : parsed

    if (isIconStoragePayload(parsed) && parsed.expire <= Date.now()) {
      window.localStorage.removeItem(getCacheKey(icon))
      return undefined
    }

    addIcon(icon, cachedIcon)
    setIconMemoryCache(icon, cachedIcon)
    return cachedIcon
  } catch {
    window.localStorage.removeItem(getCacheKey(icon))
    return undefined
  }
}

const cacheIcon = (icon: string, data: Required<IconifyIcon>) => {
  setIconMemoryCache(icon, data)
  addIcon(icon, data)

  if (!isClient()) return

  const payload: IconStoragePayload = {
    version: ICON_CACHE_VERSION,
    created: Date.now(),
    expire: Date.now() + ICON_CACHE_TTL,
    value: data
  }

  try {
    window.localStorage.setItem(getCacheKey(icon), JSON.stringify(payload))
  } catch {
    pruneStoredIconCache(1)
    try {
      window.localStorage.setItem(getCacheKey(icon), JSON.stringify(payload))
    } catch {
      // Storage can be full or blocked. The in-memory cache still prevents duplicate work.
    }
  }
}

const preloadIcon = (icon: string) => {
  const cachedIcon = restoreIconFromCache(icon)
  if (cachedIcon !== undefined) return Promise.resolve(cachedIcon)

  const loadingIcon = loadingIconMap.get(icon)
  if (loadingIcon) return loadingIcon

  const promise = loadLocalIcon(icon)
    .then((localIcon) => {
      if (!localIcon) return loadIcon(icon)
      return localIcon
    })
    .then((data) => {
      cacheIcon(icon, data)
      return data
    })
    .catch(() => {
      setIconMemoryCache(icon, null)
      return null
    })
    .finally(() => {
      loadingIconMap.delete(icon)
    })

  loadingIconMap.set(icon, promise)
  return promise
}

const props = defineProps({
  // icon name
  icon: propTypes.string,
  // icon color
  color: propTypes.string,
  // icon size
  size: propTypes.number.def(16)
})

const isLocal = computed(() => props.icon.startsWith('svg-icon:'))
const normalizedIcon = computed(() => (unref(isLocal) ? props.icon : normalizeIconName(props.icon)))
const rootRef = ref<HTMLElement>()
const isVisible = ref(false)
const isIconReady = ref(false)
let observer: IntersectionObserver | undefined
let isUnmounted = false

const symbolId = computed(() => {
  return unref(isLocal) ? `#icon-${props.icon.split('svg-icon:')[1]}` : unref(normalizedIcon)
})

const getIconifyStyle = computed(() => {
  const { color, size } = props
  return {
    fontSize: `${size}px`,
    color,
    width: `${size}px`,
    height: `${size}px`
  }
})

const loadCurrentIcon = async () => {
  if (isUnmounted) return

  if (unref(isLocal)) {
    isIconReady.value = true
    return
  }

  if (!props.icon) {
    isIconReady.value = false
    return
  }

  const icon = unref(normalizedIcon)
  const cachedIcon = restoreIconFromCache(icon)

  if (cachedIcon !== undefined) {
    isIconReady.value = !!cachedIcon
    return
  }

  if (!unref(isVisible)) {
    isIconReady.value = false
    return
  }

  const loadedIcon = await preloadIcon(icon)

  if (!isUnmounted && unref(normalizedIcon) === icon) {
    isIconReady.value = !!loadedIcon
  }
}

const initLazyObserver = async () => {
  if (!isClient()) {
    isVisible.value = true
    return
  }

  await nextTick()

  if (!rootRef.value || !window.IntersectionObserver) {
    isVisible.value = true
    return
  }

  observer = new IntersectionObserver(
    ([entry]) => {
      if (!entry?.isIntersecting) return
      isVisible.value = true
      observer?.disconnect()
      observer = undefined
    },
    {
      rootMargin: '120px'
    }
  )
  observer.observe(rootRef.value)
}

watch(
  () => [unref(normalizedIcon), unref(isVisible)],
  () => {
    void loadCurrentIcon()
  },
  {
    immediate: true
  }
)

onMounted(() => {
  isUnmounted = false
  pruneStoredIconCache()
  initLazyObserver()
})

onBeforeUnmount(() => {
  isUnmounted = true
  observer?.disconnect()
  observer = undefined
})
</script>

<template>
  <span ref="rootRef" :class="prefixCls" :style="{ fontSize: `${size}px`, color }">
    <svg v-if="isLocal" aria-hidden="true">
      <use :xlink:href="symbolId" />
    </svg>

    <iconify-icon v-else-if="isIconReady" :class="$attrs.class" :icon="symbolId" :style="getIconifyStyle" />

    <span v-else :class="$attrs.class" :style="getIconifyStyle" />
  </span>
</template>
