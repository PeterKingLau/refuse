<script setup lang="ts">
import { computed, onBeforeUnmount, ref, unref } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { propTypes } from '@/utils/propTypes'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('collapse')

defineProps({
  color: propTypes.string.def('')
})

const appStore = useAppStore()

const collapse = computed(() => appStore.getCollapse)

const isPending = ref(false)

let rafId = 0
let pendingTimer: number | undefined

const toggleCollapse = () => {
  if (unref(isPending)) return

  isPending.value = true
  const nextCollapse = !unref(collapse)

  rafId = window.requestAnimationFrame(() => {
    appStore.setCollapse(nextCollapse)
    pendingTimer = window.setTimeout(() => {
      isPending.value = false
    }, 260)
  })
}

onBeforeUnmount(() => {
  if (rafId) {
    window.cancelAnimationFrame(rafId)
  }
  if (pendingTimer) {
    window.clearTimeout(pendingTimer)
  }
})
</script>

<template>
  <button type="button" :class="[prefixCls, { 'is-pending': isPending }]" :aria-label="collapse ? '展开菜单' : '折叠菜单'" :aria-pressed="collapse" @click="toggleCollapse">
    <Icon :size="18" :icon="collapse ? 'ant-design:menu-unfold-outlined' : 'ant-design:menu-fold-outlined'" :color="color" />
  </button>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-collapse';

.@{prefix-cls} {
  display: inline-flex;
  width: 32px;
  height: 32px;
  padding: 0;
  color: inherit;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-radius: 6px;
  align-items: center;
  justify-content: center;
  transform: translateZ(0);
  transition:
    background-color 0.16s ease,
    transform 0.16s ease;
  will-change: transform;

  :deep(.v-icon),
  :deep(iconify-icon) {
    display: inline-flex;
    line-height: 1;
    align-items: center;
    justify-content: center;
  }

  &:hover {
    background-color: rgb(22 119 255 / 8%);
  }

  &:active {
    transform: translateZ(0) scale(0.94);
  }

  &.is-pending {
    pointer-events: none;
  }
}
</style>
