<template>
  <el-row>
    <el-col :span="4" style="text-align: right">销售额统计 </el-col>
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
import { ref, onMounted, getCurrentInstance } from 'vue'
import * as echarts from 'echarts'
let day = ref(3)

let ee
window.addEventListener('resize', () => {
  ee.resize()
})

onMounted(() => {
  EchartsInit()
})

const selcltChange = () => {}
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

const EchartsInit = () => {
  let test1: HTMLElement = getCurrentInstance()?.refs.echartsRef as HTMLElement
  ee = echarts.init(test1)
  ee.setOption(option)
}

let option = {
  legend: {},
  tooltip: {},
  xAxis: {
    type: 'category',
    data: ['华信达']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '销售额',
      data: [0],
      type: 'bar',
      showBackground: false,
      backgroundStyle: {
        color: 'rgba(180, 180, 180, 0.2)'
      },
      barWidth: '5%'
    },
    {
      name: '销售次数',
      data: [0],
      type: 'bar',
      showBackground: false,
      barWidth: '5%'
    },
    {
      name: '销售利润',
      data: [0],
      type: 'bar',
      showBackground: false,
      barWidth: '5%'
    }
  ]
}
</script>

<style lang="less" scoped>
.main {
  width: 100%;
  height: 300px;
}
</style>
