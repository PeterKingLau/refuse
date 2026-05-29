<script setup lang="ts">
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { Button as AButton } from 'ant-design-vue'
import { useWatermark } from '@/hooks/web/useWatermark'
import { computed, onBeforeUnmount } from 'vue'
import { useAppStore } from '@/store/modules/app'

const appStore = useAppStore()

const title = computed(() => appStore.getTitle)

const { setWatermark, clear } = useWatermark()

const { t } = useI18n()

onBeforeUnmount(() => {
  clear()
})
</script>

<template>
  <ContentWrap title="useWatermark">
    <AButton type="primary" @click="setWatermark(title)">
      {{ t('watermarkDemo.createdWatermark') }}
    </AButton>
    <AButton danger @click="clear">{{ t('watermarkDemo.clearWatermark') }}</AButton>
    <AButton type="primary" ghost @click="setWatermark(`New${title}`)">
      {{ t('watermarkDemo.resetWatermark') }}
    </AButton>
  </ContentWrap>
</template>
