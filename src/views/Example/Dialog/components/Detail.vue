<script setup lang="ts">
import { PropType } from 'vue'
import type { TableData } from '@/api/table/types'
import { Descriptions } from '@/components/Descriptions'
import { useI18n } from '@/hooks/web/useI18n'
import { Tag as ATag } from 'ant-design-vue'
import { DescriptionsSchema } from '@/types/descriptions'

const { t } = useI18n()

defineProps({
  currentRow: {
    type: Object as PropType<Nullable<TableData>>,
    default: () => null
  },
  detailSchema: {
    type: Array as PropType<DescriptionsSchema[]>,
    default: () => []
  }
})
</script>

<template>
  <Descriptions :schema="detailSchema" :data="currentRow || {}">
    <template #importance="{ row }: { row: Partial<TableData> }">
      <ATag :color="row.importance === 1 ? 'success' : row.importance === 2 ? 'warning' : 'error'">
        {{ row.importance === 1 ? t('tableDemo.important') : row.importance === 2 ? t('tableDemo.good') : t('tableDemo.commonly') }}
      </ATag>
    </template>

    <template #content="{ row }: { row: Partial<TableData> }">
      <div v-html="row.content"></div>
    </template>
  </Descriptions>
</template>
