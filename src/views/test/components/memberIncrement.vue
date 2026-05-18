<template>
  <el-row>
    <el-col :span="4">新增会员</el-col>
    <el-col :span="16" />
    <el-col :span="4">
      <el-select v-model="day" placeholder="Select" @change="selcltChange">
        <el-option v-for="item in options" :key="item.id" :label="item.label" :value="item.id" />
      </el-select>
    </el-col>
  </el-row>
  <el-divider />
  <el-row>
    <div ref="echartsRef" class="main">测试111</div>
  </el-row>
</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted, ref } from 'vue'
import * as echarts from 'echarts'
import { PATH_URL, service } from '@/config/axios/service'

let day = ref(3)
window.addEventListener('resize', () => {
  ee.resize()
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

const selcltChange = () => {
  getMember()
}

let ee
let echartsRef = ref()
onMounted(() => {
  initEcharts()
  getMember()
})

const getMember = () => {
  service.get(PATH_URL + '/MachineMange/memberIncrement?item=' + day.value).then((res: any) => {
    console.log(res)
    option.xAxis.data = res.data.title
    option.series[0].data = res.data.w1
    option.series[1].data = res.data.w2
    option.series[2].data = res.data.count
    ee.setOption(option)
  })
}

const initEcharts = () => {
  let test1: HTMLElement = getCurrentInstance()?.refs.echartsRef as HTMLElement
  ee = echarts.init(test1)
  ee.setOption(option)
}

let option = {
  legend: {},
  tooltip: {},
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [
    {
      name: '后台注册',
      data: [],
      type: 'bar',
      showBackground: false,
      backgroundStyle: {
        color: 'rgba(180, 180, 180, 0.2)'
      },
      barWidth: '5%'
    },
    {
      name: '微信注册',
      data: [],
      type: 'bar',
      showBackground: false,
      barWidth: '5%'
    },
    {
      name: '合计',
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
