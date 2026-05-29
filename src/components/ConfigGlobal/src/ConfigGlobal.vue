<script setup lang="ts">
import { provide, computed, watch, onMounted } from 'vue'
import { ConfigProvider } from 'ant-design-vue'
import type { Locale } from 'ant-design-vue/es/locale'
import { useLocaleStore } from '@/store/modules/locale'
import { useWindowSize } from '@vueuse/core'
import { useAppStore } from '@/store/modules/app'
import { setCssVar } from '@/utils'
import type { AppSize } from '@/types/ui'

const appStore = useAppStore()

const props = withDefaults(defineProps<{ size?: AppSize }>(), {
  size: 'default'
})

provide('configGlobal', props)

// 初始化所有主题色
onMounted(() => {
  appStore.setCssVarTheme()
})

const { width } = useWindowSize()

// 监听窗口变化
watch(
  () => width.value,
  (width: number) => {
    if (width < 768) {
      if (!appStore.getMobile) {
        appStore.setMobile(true)
      }
      setCssVar('--left-menu-min-width', '0')
      appStore.setCollapse(true)
      if (appStore.getLayout !== 'classic') {
        appStore.setLayout('classic')
      }
    } else {
      if (appStore.getMobile) {
        appStore.setMobile(false)
      }
      setCssVar('--left-menu-min-width', '64px')
    }
  },
  {
    immediate: true
  }
)

// 多语言相关
const localeStore = useLocaleStore()

const currentLocale = computed(() => localeStore.currentLocale)

const configLocale = computed(() => currentLocale.value.elLocale as Locale | undefined)
</script>

<template>
  <ConfigProvider :locale="configLocale">
    <slot></slot>
  </ConfigProvider>
</template>
