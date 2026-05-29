<script setup lang="ts">
import { Input as AInput } from 'ant-design-vue'
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { ref } from 'vue'

defineOptions({
  name: 'Menu111'
})

const { t } = useI18n()

const text = ref('')
</script>

<template>
  <ContentWrap :title="t('levelDemo.menu')">
    <div class="flex items-center"> Menu111: <AInput v-model:value="text" class="pl-20px" /> </div>
  </ContentWrap>
</template>
