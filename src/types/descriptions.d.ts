import type { CSSProperties } from 'vue'

export interface DescriptionsSchema {
  field: string
  label?: string
  span?: number
  class?: string
  style?: string | CSSProperties
  labelStyle?: CSSProperties
  contentStyle?: CSSProperties
  [key: string]: any
}
