<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, unref, watch } from 'vue'
import { useAppStore } from '@/store/modules/app'
import { useDesign } from '@/hooks/web/useDesign'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('logo')

const appStore = useAppStore()

const show = ref(true)

const title = computed(() => appStore.getTitle)

const layout = computed(() => appStore.getLayout)

const collapse = computed(() => appStore.getCollapse)
let showTimer: ReturnType<typeof setTimeout> | undefined

onMounted(() => {
  if (unref(collapse)) show.value = false
})

watch(
  () => collapse.value,
  (collapse: boolean) => {
    if (showTimer) {
      clearTimeout(showTimer)
    }

    if (unref(layout) === 'topLeft' || unref(layout) === 'cutMenu') {
      show.value = true
      return
    }
    if (!collapse) {
      showTimer = setTimeout(() => {
        show.value = !collapse
      }, 400)
    } else {
      show.value = !collapse
    }
  }
)

watch(
  () => layout.value,
  (layout) => {
    if (layout === 'top' || layout === 'cutMenu') {
      show.value = true
    } else {
      if (unref(collapse)) {
        show.value = false
      } else {
        show.value = true
      }
    }
  }
)

onBeforeUnmount(() => {
  if (showTimer) {
    clearTimeout(showTimer)
  }
})
</script>

<template>
  <router-link
    :class="[prefixCls, layout !== 'classic' ? `${prefixCls}__Top` : '', 'flex !h-[var(--logo-height)] items-center cursor-pointer px-14px relative overflow-hidden', 'dark:bg-[var(--app-bg-color)]']"
    to="/"
  >
    <img src="@/assets/imgs/logo.png" class="w-34px h-34px flex-none" />
    <div
      v-if="show"
      :class="[
        'ml-10px text-16px font-700 whitespace-nowrap',
        {
          'text-[var(--logo-title-text-color)]': layout === 'classic',
          'text-[var(--top-header-text-color)]': layout === 'topLeft' || layout === 'top' || layout === 'cutMenu'
        }
      ]"
    >
      {{ title }}
    </div>
  </router-link>
</template>
