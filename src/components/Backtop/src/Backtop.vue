<script setup lang="ts">
import { BackTop as ABackTop } from 'ant-design-vue'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls, variables } = useDesign()

const prefixCls = getPrefixCls('backtop')

const getTarget = () => document.querySelector<HTMLElement>(`.${variables.namespace}-layout-content-scrollbar`) || window
</script>

<template>
  <ABackTop :class="`${prefixCls}-backtop`" :target="getTarget" />
</template>
