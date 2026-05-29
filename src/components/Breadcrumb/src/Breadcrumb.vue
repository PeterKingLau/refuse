<script lang="tsx">
import { Breadcrumb as ABreadcrumb, BreadcrumbItem as ABreadcrumbItem } from 'ant-design-vue'
import { ref, watch, computed, unref, defineComponent } from 'vue'
import { useRouter } from 'vue-router'
import { usePermissionStore } from '@/store/modules/permission'
import { filterBreadcrumb } from './helper'
import { filter, treeToList } from '@/utils/tree'
import type { RouteLocationNormalizedLoaded, RouteMeta } from 'vue-router'
import { useI18n } from '@/hooks/web/useI18n'
import { Icon } from '@/components/Icon'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('breadcrumb')

const appStore = useAppStore()

// 面包屑图标
const breadcrumbIcon = computed(() => appStore.getBreadcrumbIcon)

export default defineComponent({
  name: 'Breadcrumb',
  setup() {
    const { currentRoute } = useRouter()

    const { t } = useI18n()

    const levelList = ref<AppRouteRecordRaw[]>([])

    const permissionStore = usePermissionStore()

    const menuRouters = computed(() => {
      const routers = permissionStore.getRouters
      return filterBreadcrumb(routers)
    })

    const getBreadcrumb = () => {
      const currentPath = currentRoute.value.path

      levelList.value = filter<AppRouteRecordRaw>(unref(menuRouters), (node: AppRouteRecordRaw) => {
        return node.path === currentPath
      })
    }

    const renderBreadcrumb = () => {
      const breadcrumbList = treeToList<AppRouteRecordRaw[]>(unref(levelList))
      return breadcrumbList.map((v, index) => {
        const meta = v.meta as RouteMeta
        const isCurrent = index === breadcrumbList.length - 1
        const icon = meta.icon as string | undefined

        return (
          <ABreadcrumbItem key={v.name || v.path}>
            <span
              class={[
                `${prefixCls}__content`,
                {
                  [`${prefixCls}__content--current`]: isCurrent
                }
              ]}
            >
              {breadcrumbIcon.value && icon ? <Icon icon={icon} class={`${prefixCls}__icon`}></Icon> : undefined}
              <span class={`${prefixCls}__title`}>{t(v?.meta?.title)}</span>
            </span>
          </ABreadcrumbItem>
        )
      })
    }

    watch(
      () => currentRoute.value,
      (route: RouteLocationNormalizedLoaded) => {
        if (route.path.startsWith('/redirect/')) {
          return
        }
        getBreadcrumb()
      },
      {
        immediate: true
      }
    )

    return () => (
      <ABreadcrumb separator="/" class={`${prefixCls} ml-[10px]`}>
        {renderBreadcrumb()}
      </ABreadcrumb>
    )
  }
})
</script>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-breadcrumb';

.@{prefix-cls} {
  display: inline-flex;
  height: 100%;
  font-size: 14px;
  line-height: 1;
  color: var(--top-header-text-color);
  align-items: center;

  :deep(ol) {
    display: inline-flex;
    height: 100%;
    padding: 0;
    margin: 0;
    align-items: center;
  }

  :deep(li) {
    display: inline-flex;
    height: 100%;
    align-items: center;
  }

  :deep(.ant-breadcrumb-link) {
    display: inline-flex;
    height: 100%;
    line-height: 1;
    color: var(--app-text-color-placeholder);
    align-items: center;
  }

  :deep(.ant-breadcrumb-separator) {
    display: inline-flex;
    height: 100%;
    margin-inline: 8px;
    line-height: 1;
    color: var(--app-text-color-placeholder);
    align-items: center;
  }

  :deep(.@{prefix-cls}__content) {
    display: inline-flex;
    min-height: 20px;
    line-height: 1;
    color: var(--app-text-color-placeholder);
    cursor: default;
    align-items: center;
    vertical-align: middle;

    &:hover {
      color: var(--app-text-color-placeholder);
    }
  }

  :deep(.@{prefix-cls}__content--current) {
    color: var(--app-color-primary);

    &:hover {
      color: var(--app-color-primary);
    }
  }

  :deep(.@{prefix-cls}__icon) {
    display: inline-flex;
    width: 16px;
    height: 16px;
    margin-right: 6px;
    color: currentcolor;
    line-height: 1;
    flex: none;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
  }

  :deep(.@{prefix-cls}__title) {
    display: inline-flex;
    min-height: 20px;
    line-height: 20px;
    align-items: center;
    vertical-align: middle;
  }

  :deep(.ant-breadcrumb li:last-child .ant-breadcrumb-link),
  :deep(li:last-child .ant-breadcrumb-link) {
    color: var(--app-color-primary);
  }
}
</style>
