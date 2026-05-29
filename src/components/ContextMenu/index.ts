import ContextMenu from './src/ContextMenu.vue'
import { Dropdown as ADropdown } from 'ant-design-vue'
import type { RouteLocationNormalizedLoaded } from 'vue-router'

export interface ContextMenuExpose {
  close: () => void
  elDropdownMenuRef: ComponentRef<typeof ADropdown>
  tagItem: RouteLocationNormalizedLoaded
}

export { ContextMenu }
