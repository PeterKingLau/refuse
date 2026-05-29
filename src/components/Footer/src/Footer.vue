<script setup lang="ts">
import { useAppStore } from '@/store/modules/app'
import { computed } from 'vue'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('footer')

const appStore = useAppStore()

const title = computed(() => appStore.getTitle)
</script>

<template>
  <div :class="prefixCls">
    <span class="copyright">Copyright ©2021-present {{ title }}</span>
  </div>
</template>

<style lang="less" scoped>
@prefix-cls: ~'@{namespace}-footer';

.@{prefix-cls} {
  display: flex;
  height: var(--app-footer-height);
  padding: 0 24px;
  color: rgb(0 0 0 / 45%);
  font-size: 13px;
  line-height: 1;
  background-color: var(--app-content-bg-color);
  border-top: 1px solid rgb(5 5 5 / 6%);
  align-items: center;
  justify-content: center;
}

.copyright {
  display: inline-flex;
  align-items: center;
}

.dark {
  .@{prefix-cls} {
    color: rgb(255 255 255 / 45%);
    background-color: var(--app-bg-color);
    border-top-color: rgb(255 255 255 / 10%);
  }
}
</style>
