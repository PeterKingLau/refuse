<script setup lang="ts">
import { Card as ACard, Tooltip as ATooltip } from 'ant-design-vue'
import { propTypes } from '@/utils/propTypes'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('content-wrap')

defineProps({
  title: propTypes.string.def(''),
  message: propTypes.string.def('')
})
</script>

<template>
  <ACard :class="[prefixCls]" :bordered="true">
    <template v-if="title" #title>
      <div class="flex items-center">
        <span class="text-16px font-700">{{ title }}</span>
        <ATooltip v-if="message" placement="right">
          <template #title>
            <div class="max-w-200px">{{ message }}</div>
          </template>
          <Icon class="ml-5px" icon="bi:question-circle-fill" :size="14" />
        </ATooltip>
      </div>
    </template>
    <div>
      <slot></slot>
    </div>
  </ACard>
</template>
