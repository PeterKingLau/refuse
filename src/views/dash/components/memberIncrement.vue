<template>
  <ACard :bordered="false" class="chart-card">
    <template #title>
      <span class="chart-title">新增会员</span>
    </template>
    <template #extra>
      <ASelect v-model:value="day" placeholder="Select" class="chart-select" @change="selcltChange">
        <ASelectOption v-for="item in timeOptions" :key="item.id" :value="item.id">
          {{ item.label }}
        </ASelectOption>
      </ASelect>
    </template>
    <div ref="chartContainerRef" class="chart-main"></div>
  </ACard>
</template>

<script lang="ts" setup>
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { Card as ACard, Select as ASelect, SelectOption as ASelectOption } from 'ant-design-vue'
import { PATH_URL, service } from '@/config/axios/service'
import { createDashboardChart, renderDashboardChart, timeOptions, toDashboardChartData } from '@/utils/g2Chart'

const day = ref(3)
const chartContainerRef = ref<HTMLElement>()
let chart: ReturnType<typeof createDashboardChart> | undefined

onMounted(() => {
  if (chartContainerRef.value) {
    chart = createDashboardChart(chartContainerRef.value)
    getMember()
  }
})

onBeforeUnmount(() => {
  chart?.destroy()
})

const selcltChange = () => {
  getMember()
}

const getMember = () => {
  service.get(PATH_URL + '/MachineMange/memberIncrement?item=' + day.value).then((res: any) => {
    const categories = res.data.title || []
    const data = toDashboardChartData(categories, [
      {
        name: '后台注册',
        data: res.data.w1 || []
      },
      {
        name: '微信注册',
        data: res.data.w2 || []
      },
      {
        name: '合计',
        data: res.data.count || []
      }
    ])

    if (chart) {
      renderDashboardChart(chart, 'bar', data)
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
