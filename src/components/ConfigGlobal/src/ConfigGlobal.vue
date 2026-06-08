<script setup lang="ts">
import { provide, computed, watch, onMounted } from 'vue'
import { ConfigProvider, theme as antTheme } from 'ant-design-vue'
import type { SizeType } from 'ant-design-vue/es/config-provider'
import type { Locale } from 'ant-design-vue/es/locale'
import type { ThemeConfig } from 'ant-design-vue/es/config-provider/context'
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

const themeConfig = computed<ThemeConfig>(() => {
  const isDark = appStore.getIsDark
  const primaryColor = appStore.getTheme.appColorPrimary || '#1677ff'

  return {
    algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      colorPrimary: primaryColor,
      colorBgLayout: isDark ? '#0f172a' : '#f4f6fa',
      colorBgContainer: isDark ? '#141f33' : '#fff',
      colorBorder: isDark ? '#334155' : '#d9d9d9',
      colorText: isDark ? '#e5e7eb' : '#262626',
      colorTextSecondary: isDark ? '#cbd5e1' : '#595959',
      borderRadius: 6
    }
  }
})

const antComponentSize = computed<SizeType>(() => {
  if (props.size === 'default') return 'middle'

  return props.size
})
</script>

<template>
  <ConfigProvider :locale="configLocale" :component-size="antComponentSize" :theme="themeConfig">
    <slot></slot>
  </ConfigProvider>
</template>
