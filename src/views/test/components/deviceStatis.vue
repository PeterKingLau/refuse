<template>
  <el-row>
    <el-col :span="4" style="text-align: right">新增设备 </el-col>
    <el-col :span="16" />
    <el-col :span="4">
      <el-select v-model="day" placeholder="Select" @change="selcltChange">
        <el-option v-for="item in options" :key="item.id" :label="item.label" :value="item.id" />
      </el-select>
    </el-col>
  </el-row>
  <el-divider />
  <el-row>
    <div class="main" ref="echartsRef"></div>
  </el-row>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'
import { ref, onMounted, getCurrentInstance } from 'vue'
import * as echarts from 'echarts'

window.addEventListener('resize', () => {
  ee.resize()
})

const selcltChange = () => {
  getDeviceData()
}

const getDeviceData = () => {
  service
    .get(PATH_URL + '/MachineMange/GetDeviceGroupByDepartment?item=' + day.value)
    .then((res: any) => {
      console.log('res22222', res)
      option.xAxis.data = res.data.pName
      option.series[0].data = res.data.cc1
      option.series[1].data = res.data.cc2
      option.series[2].data = res.data.count
      ee.setOption(option)
    })
}
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
    data: []
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: 'DTU',
      data: [],
      type: 'line',
      smooth: true
    },
    {
      name: '安卓',
      data: [],
      type: 'line',
      smooth: true
    },
    {
      name: '设备总数',
      data: [],
      type: 'line',
      smooth: true
    }
  ]
}

let day = ref(6)
onMounted(() => {
  initEcharts()
  getDeviceData()
})

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
