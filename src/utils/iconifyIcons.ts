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

const iconAliasMap: Record<string, string> = {
  'ant-design:line-chart-outlined': 'mdi:chart-line'
}

const fallbackPublicIconSetFiles: PublicIconSetFile[] = [
  { name: 'Element Plus', prefix: 'ep', path: 'ep-icons.json' },
  { name: 'Material Design', prefix: 'mdi', path: 'mdi-icons.json' },
  { name: 'Material Symbols', prefix: 'material-symbols', path: 'material-symbols-icons.json' },
  { name: 'Simple Icons', prefix: 'simple-icons', path: 'simple-icons-icons.json' }
]

const iconCollectionMap = new Map<string, IconifyCollection>()
let cachedIconSets: LocalIconSet[] | undefined

const getPublicIconUrl = (fileName: string) => {
  const baseUrl = import.meta.env.BASE_URL || '/'
  return `${baseUrl.replace(/\/?$/, '/')}iconify/${fileName}`
}

const loadPublicIconSetFiles = async () => {
  try {
    const response = await fetch(getPublicIconUrl('icon-sets.json'))
    if (!response.ok) return fallbackPublicIconSetFiles

    const files = (await response.json()) as PublicIconSetFile[]
    return files.filter((file) => file.name && file.path)
  } catch {
    return fallbackPublicIconSetFiles
  }
}

export const normalizeIconName = (icon?: string) => {
  if (!icon) return ''
  return iconAliasMap[icon] || icon
}

const loadPublicIconSet = async (file: PublicIconSetFile): Promise<LocalIconSet | undefined> => {
  try {
    const response = await fetch(getPublicIconUrl(file.path))
    if (!response.ok) return undefined

    const collection = (await response.json()) as IconifyCollection
    iconCollectionMap.set(collection.prefix, collection)

    return {
      name: file.name,
      prefix: collection.prefix,
      icons: Object.keys(collection.icons)
    }
  } catch {
    return undefined
  }
}

export const loadLocalIconSets = async () => {
  if (cachedIconSets) return cachedIconSets

  const publicIconSetFiles = await loadPublicIconSetFiles()
  cachedIconSets = (await Promise.all(publicIconSetFiles.map(loadPublicIconSet))).filter(Boolean) as LocalIconSet[]
  return cachedIconSets
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

  const response = await fetch(`https://api.iconify.design/search?query=${encodeURIComponent(query)}&limit=${limit}`)
  if (!response.ok) return []

  const data = (await response.json()) as IconifySearchResponse
  return (data.icons || []).map(normalizeIconName)
}
