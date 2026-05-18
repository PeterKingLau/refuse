<template>
  <el-row>
    <el-col :span="4" style="text-align: right">垃圾投递数据</el-col>
    <el-col :span="16" />
    <el-col :span="4">
      <el-select v-model="day" placeholder="Select" @change="selcltChange">
        <el-option v-for="item in options" :key="item.id" :label="item.label" :value="item.id" />
      </el-select>
    </el-col>
  </el-row>
  <el-divider />
  <el-row>
    <div ref="echartsRef" class="main"></div>
  </el-row>
</template>

<script setup lang="ts">
import { ref, onMounted, getCurrentInstance } from 'vue'
import * as echarts from 'echarts'
import { PATH_URL, service } from '@/config/axios/service'
onMounted(() => {
  EchartsInit()
  getOrderStatis()
})

const EchartsInit = () => {
  let test1: HTMLElement = getCurrentInstance()?.refs.echartsRef as HTMLElement
  ee = echarts.init(test1)
  ee.setOption(option)
}

const getOrderStatis = () => {
  service.get(PATH_URL + '/MachineMange/OrderStatis?item=' + day.value).then((res: any) => {
    option.xAxis.data = res.data.pName
    option.series[0].data = res.data.weight
    option.series[1].data = res.data.cc
    ee.setOption(option)
  })
}

window.addEventListener('resize', () => {
  ee.resize()
})

let selcltChange = () => {
  getOrderStatis()
}

let day = ref(6)
let ee
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

let option = {
  legend: {},
  tooltip: {},
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '投递重量',
      data: [],
      type: 'bar',
      showBackground: false,
      backgroundStyle: {
        color: 'rgba(180, 180, 180, 0.2)'
      },
      barWidth: '5%'
    },
    {
      name: '投递次数',
      data: [],
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
