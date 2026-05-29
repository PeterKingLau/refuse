import type { RouteMeta } from 'vue-router'
import { Icon } from '@/components/Icon'
import { useI18n } from '@/hooks/web/useI18n'

export const useRenderMenuTitle = () => {
  const renderMenuTitle = (meta: RouteMeta) => {
    const { t } = useI18n()
    const { title = 'Please set title' } = meta
    const icon = meta.icon as string | undefined

    return (
      <span class="v-menu__title-wrap">
        {icon ? <Icon class="v-menu__icon" icon={icon}></Icon> : undefined}
        <span class="v-menu__title">{t(title as string)}</span>
      </span>
    )
  }

  const renderMenuSlots = (meta: RouteMeta) => {
    const { t } = useI18n()
    const { title = 'Please set title' } = meta
    const icon = meta.icon as string | undefined

    return {
      icon: () => (icon ? <Icon class="v-menu__icon" icon={icon}></Icon> : undefined),
      title: () => <span class="v-menu__title">{t(title as string)}</span>
    }
  }

  return {
    renderMenuTitle,
    renderMenuSlots
  }
}
