<script lang="tsx">
import { computed, defineComponent, unref, PropType, ref, watch } from 'vue'
import { Menu as AntMenu } from 'ant-design-vue'
import { useAppStore } from '@/store/modules/app'
import { usePermissionStore } from '@/store/modules/permission'
import { useRenderMenuItem } from './components/useRenderMenuItem'
import { useRouter } from 'vue-router'
import { isUrl } from '@/utils/is'
import { useDesign } from '@/hooks/web/useDesign'
import { LayoutType } from '@/types/layout'
import { pathResolve } from '@/utils/routerHelper'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('menu')

export default defineComponent({
  name: 'Menu',
  props: {
    menuSelect: {
      type: Function as PropType<(index: string) => void>,
      default: undefined
    }
  },
  setup(props) {
    const appStore = useAppStore()

    const layout = computed(() => appStore.getLayout)

    const { push, currentRoute } = useRouter()

    const permissionStore = usePermissionStore()

    const menuMode = computed((): 'vertical' | 'horizontal' => {
      const vertical: LayoutType[] = ['classic', 'topLeft', 'cutMenu']

      if (vertical.includes(unref(layout))) {
        return 'vertical'
      } else {
        return 'horizontal'
      }
    })

    const routers = computed(() => (unref(layout) === 'cutMenu' ? permissionStore.getMenuTabRouters : permissionStore.getRouters))

    const collapse = computed(() => appStore.getCollapse)

    const activeMenu = computed(() => {
      const { meta, path } = unref(currentRoute)
      if (meta.activeMenu) {
        return meta.activeMenu as string
      }
      return path
    })

    const openKeys = ref<string[]>([])

    const getActiveOpenKeys = (menuRouters: AppRouteRecordRaw[], targetPath: string, parentPath = '/'): string[] => {
      for (const route of menuRouters) {
        if (route?.meta?.hidden) continue

        const fullPath = isUrl(route.path) ? route.path : pathResolve(parentPath, route.path)
        const childOpenKeys = route.children?.length ? getActiveOpenKeys(route.children, targetPath, fullPath) : []

        if (childOpenKeys.length > 0) {
          return [fullPath, ...childOpenKeys]
        }

        if (route.children?.length && targetPath.startsWith(`${fullPath}/`)) {
          return [fullPath]
        }
      }

      return []
    }

    watch(
      [activeMenu, routers, collapse, menuMode],
      () => {
        if (unref(menuMode) !== 'vertical' || unref(collapse)) {
          openKeys.value = []
          return
        }

        openKeys.value = getActiveOpenKeys(unref(routers), unref(activeMenu))
      },
      {
        immediate: true
      }
    )

    const menuSelect = (index?: string | number | symbol | null) => {
      if (typeof index !== 'string' || !index) return

      if (props.menuSelect) {
        props.menuSelect(index)
      }

      if (isUrl(index)) {
        console.log('windows.open')
        window.open(index)
      } else {
        push(index)
      }
    }

    const renderMenuWrap = () => {
      if (unref(layout) === 'top') {
        return renderMenu()
      } else {
        return <div class={`${prefixCls}__scroll`}>{renderMenu()}</div>
      }
    }

    const renderMenu = () => {
      const mode = unref(menuMode) === 'vertical' ? 'inline' : 'horizontal'
      const isCollapsed = unref(layout) === 'top' || unref(layout) === 'cutMenu' ? false : unref(collapse)
      const currentOpenKeys = mode === 'inline' && !isCollapsed ? unref(openKeys) : undefined

      return (
        <AntMenu
          selectedKeys={[unref(activeMenu)]}
          openKeys={currentOpenKeys}
          mode={mode}
          inlineCollapsed={mode === 'inline' ? isCollapsed : undefined}
          onClick={({ key }) => menuSelect(key)}
          onOpenChange={(keys) => {
            openKeys.value = keys as string[]
          }}
        >
          {{
            default: () => {
              const { renderMenuItem } = useRenderMenuItem(unref(menuMode))
              return renderMenuItem(unref(routers))
            }
          }}
        </AntMenu>
      )
    }

    return () => (
      <div
        id={prefixCls}
        class={[
          `${prefixCls} ${prefixCls}__${unref(menuMode)}`,
          'h-[100%] overflow-hidden flex-col bg-[var(--left-menu-bg-color)] shadow-[inset_-1px_0_0_var(--left-menu-border-color)]',
          {
            'w-[var(--left-menu-min-width)]': unref(collapse) && unref(layout) !== 'cutMenu',
            'w-[var(--left-menu-max-width)]': !unref(collapse) && unref(layout) !== 'cutMenu'
          }
        ]}
      >
        {renderMenuWrap()}
      </div>
    )
  }
})
</script>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-menu';

.is-active--after {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  background-color: var(--app-color-primary);
  content: '';
}

.@{prefix-cls} {
  position: relative;
  overflow: hidden;
  padding-top: 3px;
  transition: width var(--transition-time-02);

  &:after {
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    border-left: 1px solid var(--left-menu-border-color);
    content: '';
  }

  :deep(.ant-menu) {
    width: 100% !important;
    max-height: 100%;
    border-right: none;
    color: var(--left-menu-text-color);
    background: transparent !important;
    border-inline-end: 0;

    .ant-menu-submenu-selected {
      & > .ant-menu-submenu-title {
        color: var(--left-menu-text-active-color) !important;
      }
    }

    .ant-menu-submenu-title,
    .ant-menu-item {
      &:hover {
        color: var(--left-menu-text-active-color) !important;
        background-color: rgb(255 255 255 / 7%) !important;
      }
    }

    .ant-menu-item-selected {
      color: var(--left-menu-text-active-color) !important;
      background-color: var(--left-menu-bg-active-color) !important;

      &:hover {
        background-color: var(--left-menu-bg-active-color) !important;
      }
    }

    .ant-menu-item-selected {
      position: relative;

      &:after {
        display: none;
      }
    }

    .ant-menu-sub {
      color: var(--left-menu-text-color);
      background: transparent !important;

      .ant-menu-submenu-title,
      .ant-menu-item:not(.ant-menu-item-selected) {
        background-color: transparent !important;
      }
    }
  }

  &__scroll {
    height: 100%;
    overflow-x: hidden;
    overflow-y: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }

    :deep(.ant-menu) {
      min-height: 100%;
      overflow: visible;
    }
  }

  :deep(.ant-menu-inline),
  :deep(.ant-menu-vertical) {
    padding: 0 8px 10px;
  }

  :deep(.ant-menu-item),
  :deep(.ant-menu-submenu-title) {
    width: 100% !important;
    height: 42px !important;
    margin: 4px 0 !important;
    padding-inline: 24px 14px !important;
    color: var(--left-menu-text-color) !important;
    line-height: 42px !important;
    border-radius: 8px !important;
  }

  :deep(.ant-menu-inline-collapsed > .ant-menu-item),
  :deep(.ant-menu-inline-collapsed > .ant-menu-submenu > .ant-menu-submenu-title) {
    padding-inline: calc(50% - 8px) !important;
  }

  :deep(.ant-menu-item:hover),
  :deep(.ant-menu-submenu-title:hover) {
    color: var(--left-menu-text-active-color) !important;
    background: rgb(255 255 255 / 8%) !important;
  }

  :deep(.ant-menu-item-selected) {
    color: var(--left-menu-text-active-color) !important;
    background: var(--left-menu-bg-active-color) !important;
    box-shadow:
      0 0 0 1px rgb(255 255 255 / 18%) inset,
      0 8px 18px rgb(22 119 255 / 35%);
  }

  :deep(.ant-menu-submenu-selected > .ant-menu-submenu-title) {
    color: var(--left-menu-text-active-color) !important;
  }

  :deep(.ant-menu-submenu-arrow) {
    color: currentcolor !important;
  }

  :deep(.ant-menu-title-content) {
    min-width: 0;
    margin-inline-start: 0;
    font-weight: 600;
  }

  :deep(.v-menu__title-wrap) {
    display: inline-flex;
    width: 100%;
    min-width: 0;
    align-items: center;
    vertical-align: middle;
  }

  :deep(.v-menu__icon) {
    display: inline-flex;
    width: 16px;
    min-width: 16px;
    height: 16px;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  :deep(.v-menu__title) {
    display: inline-block;
    min-width: 0;
    margin-left: 10px;
    overflow: hidden;
    font-size: 14px;
    letter-spacing: 0;
    text-overflow: ellipsis;
    vertical-align: middle;
    white-space: nowrap;
  }

  :deep(.ant-menu-item-icon),
  :deep(.ant-menu-submenu-title .anticon),
  :deep(.ant-menu-submenu-title svg),
  :deep(.v-menu__icon span),
  :deep(.v-menu__icon iconify-icon) {
    color: currentcolor;
    font-size: 16px;
  }

  :deep(.ant-menu-sub) {
    padding: 0 0 2px;
  }

  :deep(.ant-menu-sub .ant-menu-item),
  :deep(.ant-menu-sub .ant-menu-submenu-title) {
    height: 42px !important;
    margin: 0 !important;
    padding-left: 48px !important;
    font-size: 14px;
    line-height: 42px !important;
    border-radius: 8px !important;
    box-shadow: none;
  }

  :deep(.ant-menu-sub .ant-menu-item-selected) {
    background: rgb(22 119 255 / 18%) !important;
    box-shadow: none;
  }

  :deep(.ant-menu-sub .ant-menu-title-content) {
    margin-inline-start: 0;
    font-weight: 600;
  }

  :deep(.ant-menu-inline-collapsed) {
    width: var(--left-menu-min-width);

    & > .ant-menu-item-selected {
      position: relative;
      background-color: var(--left-menu-collapse-bg-active-color) !important;

      &:after {
        display: none;
      }
    }
  }

  :deep(.horizontal-collapse-transition) {
    .@{prefix-cls}__title {
      display: none;
    }
  }

  &__horizontal {
    height: calc(~'var(--top-tool-height)') !important;

    :deep(.ant-menu-horizontal) {
      height: calc(~'var(--top-tool-height)');
      border-bottom: none;

      & > .ant-menu-submenu-selected {
        .ant-menu-submenu-title {
          border-bottom-color: var(--app-color-primary) !important;
        }
      }

      .ant-menu-item-selected {
        position: relative;

        &:after {
          display: none !important;
        }
      }

      .@{prefix-cls}__title {
        max-height: calc(~'var(--top-tool-height) - 2px') !important;
        line-height: calc(~'var(--top-tool-height) - 2px');
      }
    }
  }
}
</style>

<style lang="less">
@prefix-cls: ~'@{namespace}-menu-popper';

.is-active--after {
  position: absolute;
  top: 0;
  right: 0;
  width: 4px;
  height: 100%;
  background-color: var(--app-color-primary);
  content: '';
}

.@{prefix-cls}--vertical,
.@{prefix-cls}--horizontal {
  .ant-menu {
    padding: 6px;
  }

  .ant-menu-submenu-selected {
    & > .ant-menu-submenu-title {
      color: var(--left-menu-text-active-color) !important;
    }
  }

  .ant-menu-submenu-title,
  .ant-menu-item {
    display: flex !important;
    height: 40px !important;
    margin: 2px 0 !important;
    padding-inline: 14px 16px !important;
    line-height: 40px !important;
    align-items: center !important;
    border-radius: 6px !important;

    &:hover {
      color: var(--left-menu-text-active-color) !important;
      background-color: var(--left-menu-bg-color) !important;
    }
  }

  .ant-menu-title-content {
    display: inline-flex;
    min-width: 0;
    margin-inline-start: 0 !important;
    line-height: 1;
    align-items: center;
  }

  .v-menu__title-wrap {
    display: inline-flex;
    width: 100%;
    min-width: 0;
    line-height: 1;
    align-items: center;
  }

  .v-menu__icon {
    display: inline-flex;
    width: 18px;
    min-width: 18px;
    height: 18px;
    margin-right: 10px;
    line-height: 1;
    align-items: center;
    justify-content: center;

    .v-icon,
    span,
    iconify-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 1;
    }
  }

  .v-menu__title {
    display: inline-flex;
    min-width: 0;
    margin-left: 0;
    overflow: hidden;
    font-size: 14px;
    line-height: 18px;
    align-items: center;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .ant-menu-item.ant-menu-item-selected {
    position: relative;
    background-color: var(--left-menu-bg-active-color) !important;

    &:hover {
      background-color: var(--left-menu-bg-active-color) !important;
    }

    &:after {
      display: none;
    }
  }
}
</style>
