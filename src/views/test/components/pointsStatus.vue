<template>
  <el-row>
    <el-col :span="4"> 积分总数</el-col>
    <el-col :span="16" />
    <el-col :span="4">
      <el-select v-model="day" @change="onchange" placeholder="Select">
        <el-option v-for="item in options" :key="item.id" :label="item.label" :value="item.id" />
      </el-select>
    </el-col>
  </el-row>
  <el-divider />
  <el-row>
    <div ref="echartsRef" class="main"> </div>
  </el-row>
</template>

<script setup lang="ts">
import { ref, getCurrentInstance, onMounted } from 'vue'
import * as echarts from 'echarts'
import { PATH_URL, service } from '@/config/axios/service'

window.addEventListener('resize', () => {
  ee.resize()
})

onMounted(() => {
  initEcharts()
  getPointsData()
})

const onchange = () => {
  getPointsData()
}

const getPointsData = () => {
  service
    .get(PATH_URL + '/MachineMange/PointGroupByDepartment?item=' + day.value)
    .then((res: any) => {
      console.log('res', res)
      option.xAxis.data = res.data.pName
      option.series[0].data = res.data.points
      ee.setOption(option)
    })
}

let day = ref(6)
let ee
const initEcharts = () => {
  let test1: HTMLElement = getCurrentInstance()?.refs.echartsRef as HTMLElement
  ee = echarts.init(test1)
  ee.setOption(option)
}

let option = {
  legend: {
    type: 'plain'
  },
  tooltip: {
    show: true,
    axisPointer: {
      type: 'cross'
    }
  },
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      data: [820, 932, 901, 934, 1290, 1330, 1320],
      type: 'line',
      smooth: true
    }
  ]
}

let options = [
  {
    id: 1,
    label: '今日'
  },
  {
    id: 2,
    label: '昨日'
  },
  {
    id: 3,
    label: '近7日'
  },
  {
    id: 4,
    label: '近30日'
  },
  {
    id: 5,
    label: '近180日'
  },
  {
    id: 6,
    label: '近365日'
  }
]
</script>

<style lang="less" scoped>
.main {
  width: 100%;
  height: 300px;
}
</style>
