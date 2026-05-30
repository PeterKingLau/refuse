<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { Dropdown as ADropdown, Menu as AMenu, MenuItem as AMenuItem } from 'ant-design-vue'
import { useAppStore } from '@/store/modules/app'
import { useI18n } from '@/hooks/web/useI18n'
import { propTypes } from '@/utils/propTypes'
import { useDesign } from '@/hooks/web/useDesign'
import type { AppSize } from '@/types/ui'

defineOptions({
  inheritAttrs: false
})

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('size-dropdown')
const attrs = useAttrs()

defineProps({
  color: propTypes.string.def('')
})

const { t } = useI18n()

const appStore = useAppStore()

const sizeMap = computed(() => appStore.sizeMap)

const setCurrentSize = (size: AppSize) => {
  appStore.setCurrentSize(size)
}

const handleMenuClick = ({ key }: { key: string | number }) => {
  setCurrentSize(key as AppSize)
}

const triggerAttrs = computed(() => {
  const { class: _class, ...rest } = attrs
  return rest
})
</script>

<template>
  <ADropdown :trigger="['click']">
    <div v-bind="triggerAttrs" :class="[prefixCls, attrs.class]">
      <Icon :size="18" icon="mdi:format-size" :color="color || 'currentColor'" />
    </div>
    <template #overlay>
      <AMenu :selected-keys="[appStore.getCurrentSize]" @click="handleMenuClick">
        <AMenuItem v-for="item in sizeMap" :key="item">
          {{ t(`size.${item}`) }}
        </AMenuItem>
      </AMenu>
    </template>
  </ADropdown>
</template>
