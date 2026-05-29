import { Menu as AntMenu } from 'ant-design-vue'
import type { RouteMeta } from 'vue-router'
import { hasOneShowingChild } from '../helper'
import { isUrl } from '@/utils/is'
import { useRenderMenuTitle } from './useRenderMenuTitle'
import { useDesign } from '@/hooks/web/useDesign'
import { pathResolve } from '@/utils/routerHelper'

export const useRenderMenuItem = (
  // allRouters: AppRouteRecordRaw[] = [],
  menuMode: 'vertical' | 'horizontal'
) => {
  const renderMenuItem = (routers: AppRouteRecordRaw[], parentPath = '/') => {
    return routers.map((v) => {
      const meta = (v.meta ?? {}) as RouteMeta

      if (!meta.hidden) {
        const { oneShowingChild, onlyOneChild } = hasOneShowingChild(v.children, v)
        const fullPath = isUrl(v.path) ? v.path : pathResolve(parentPath, v.path) // getAllParentPath<AppRouteRecordRaw>(allRouters, v.path).join('/')
        const hasChildren = Array.isArray(v.children) && v.children.length > 0

        const { renderMenuTitle } = useRenderMenuTitle()

        if (!hasChildren) {
          return (
            <AntMenu.Item key={fullPath}>
              {{
                default: () => renderMenuTitle(meta)
              }}
            </AntMenu.Item>
          )
        }

        if (oneShowingChild && (!onlyOneChild?.children || onlyOneChild?.noShowingChildren) && !meta?.alwaysShow) {
          const menuKey = onlyOneChild ? pathResolve(fullPath, onlyOneChild.path) : fullPath

          return (
            <AntMenu.Item key={menuKey}>
              {{
                default: () => renderMenuTitle(onlyOneChild ? onlyOneChild?.meta : meta)
              }}
            </AntMenu.Item>
          )
        } else {
          const { getPrefixCls } = useDesign()

          const preFixCls = getPrefixCls('menu-popper')
          return (
            <AntMenu.SubMenu key={fullPath} popupClassName={menuMode === 'vertical' ? `${preFixCls}--vertical` : `${preFixCls}--horizontal`} title={renderMenuTitle(meta)}>
              {{
                default: () => renderMenuItem(v.children!, fullPath)
              }}
            </AntMenu.SubMenu>
          )
        }
      }
    })
  }

  return {
    renderMenuItem
  }
}
