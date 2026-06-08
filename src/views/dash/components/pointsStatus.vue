<template>
  <ACard :bordered="false" class="chart-card">
    <template #title>
      <span class="chart-title">积分总数</span>
    </template>
    <template #extra>
      <ASelect v-model:value="day" placeholder="Select" class="chart-select" @change="onchange">
        <ASelectOption v-for="item in timeOptions" :key="item.id" :value="item.id">
          {{ item.label }}
        </ASelectOption>
      </ASelect>
    </template>
    <div ref="chartContainerRef" class="chart-main"></div>
  </ACard>
</template>

<script setup lang="ts">
import { getPointGroupByDepartmentApi } from '@/api/machine'

import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Card as ACard, Select as ASelect, SelectOption as ASelectOption } from 'ant-design-vue'
import * as requestApi from '@/api/request'
import { createDashboardChart, renderDashboardChart, timeOptions, toDashboardChartData } from '@/utils/g2Chart'

const day = ref(6)
const chartContainerRef = ref<HTMLElement>()
let chart: ReturnType<typeof createDashboardChart> | undefined

onMounted(() => {
  if (chartContainerRef.value) {
    chart = createDashboardChart(chartContainerRef.value)
    getPointsData()
  }
})

onBeforeUnmount(() => {
  chart?.destroy()
})

const onchange = () => {
  getPointsData()
}

const getPointsData = () => {
  getPointGroupByDepartmentApi(day.value).then((res: any) => {
    console.log('res', res)
    const categories = res.data.pName || []
    const data = toDashboardChartData(categories, [
      {
        name: '积分',
        data: res.data.points || []
      }
    ])

    if (chart) {
      renderDashboardChart(chart, 'line', data)
    }
  })
}
</script>

<style lang="less" scoped>
.chart-card {
  width: 100%;
  border-radius: 8px;
  box-shadow: 0 1px 4px rgb(0 0 0 / 6%);

  :deep(.ant-card-head) {
    min-height: 48px;
    padding: 0 16px;
  }

  :deep(.ant-card-body) {
    padding: 12px 16px 16px;
  }
}

.chart-title {
  font-weight: 600;
}

.chart-select {
  width: 136px;
}

.chart-main {
  width: 100%;
  height: 320px;
}
</style>
