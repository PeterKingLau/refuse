<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { Switch as ASwitch } from 'ant-design-vue'
import { useIcon } from '@/hooks/web/useIcon'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('theme-switch')

const Sun = useIcon({ icon: 'emojione-monotone:sun', color: '#fde047' })

const CrescentMoon = useIcon({ icon: 'emojione-monotone:crescent-moon', color: '#fde047' })

const appStore = useAppStore()

// 初始化获取是否是暗黑主题
const isDark = computed({
  get: () => appStore.getIsDark,
  set: (val: boolean) => {
    appStore.setIsDark(val)
  }
})

// 设置switch的背景颜色
</script>

<template>
  <ASwitch :class="prefixCls" v-model:checked="isDark">
    <template #checkedChildren>
      <component :is="Sun" />
    </template>
    <template #unCheckedChildren>
      <component :is="CrescentMoon" />
    </template>
  </ASwitch>
</template>
