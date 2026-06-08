<template>
  <ARow :gutter="[16, 16]" class="count-row">
    <ACol v-for="item in countCards" :key="item.title" class="count-col" :xs="24" :sm="12" :lg="8">
      <div class="main">
        <div class="top">{{ item.title }}</div>
        <div class="content" :class="item.className">
          <div class="c_left">
            <img
              :src="item.icon"
              class="signPIC"
              :style="{
                '--icon-width': `${item.iconWidth}px`,
                '--icon-height': `${item.iconHeight}px`
              }"
            />
          </div>
          <div class="c_right">
            <div class="cc_top">
              {{ item.value }}
              <span class="unit">{{ item.unit }}</span>
            </div>
            <div class="cc_bottom">
              <span>{{ item.firstLabel }}</span>
              <span :class="item.warn ? 'is-danger' : 'is-primary'">{{ item.firstValue }}</span>
              <span class="ml-2">{{ item.secondLabel }}</span>
              <span :class="item.warn ? 'is-danger' : 'is-primary'">{{ item.secondValue }}</span>
            </div>
          </div>
        </div>
      </div>
    </ACol>
  </ARow>
</template>

<script setup lang="ts">
import { getDeviceCountApi, getMemberCountApi, getPointCountApi, getWarningCountApi } from '@/api/machine'

import { computed, onMounted, ref } from 'vue'
import { Col as ACol, Row as ARow } from 'ant-design-vue'
import * as requestApi from '@/api/request'
import s1 from '@/assets/imgs/s1.png'
import s2 from '@/assets/imgs/s2.png'
import s3 from '@/assets/imgs/s3.png'
import s4 from '@/assets/imgs/s4.png'
import s5 from '@/assets/imgs/s5.png'

type NumberLike = number | string | null | undefined

const toSafeNumber = (value: NumberLike, fallback = 0) => {
  const numberValue = Number(value)
  return Number.isFinite(numberValue) ? numberValue : fallback
}

const formatPercent = (value: NumberLike) => `${toSafeNumber(value)}%`

onMounted(() => {
  getDeviceData()
  getWarningData()
  getMemberCount()
  getPointsData()
})

const getPointsData = () => {
  getPointCountApi().then((res: any) => {
    point_count.value = toSafeNumber(res.data?.count)
    point_thisMonth.value = toSafeNumber(res.data?.thisMonth)
    point_QOQ.value = toSafeNumber(res.data?.QOQ)
  })
}

const getMemberCount = () => {
  getMemberCountApi().then((res: any) => {
    m_count.value = toSafeNumber(res.data?.count)
    m_thisMonth.value = toSafeNumber(res.data?.thisMonth)
    m_QOQ.value = toSafeNumber(res.data?.QOQ)
  })
}

const getDeviceData = () => {
  getDeviceCountApi().then((res: any) => {
    deviceCount.value = toSafeNumber(res.data?.cc)
    deviceOffline.value = toSafeNumber(res.data?.off)
    deviceOnLine.value = toSafeNumber(res.data?.on)
  })
}

const getWarningData = () => {
  getWarningCountApi().then((res: any) => {
    w_count.value = toSafeNumber(res.data?.count)
    w_1.value = toSafeNumber(res.data?.w1)
    w_2.value = toSafeNumber(res.data?.w2)
  })
}

const deviceCount = ref(0)
const deviceOnLine = ref(0)
const deviceOffline = ref(0)

const w_count = ref(0)
const w_1 = ref(0)
const w_2 = ref(0)

const m_count = ref(0)
const m_thisMonth = ref(0)
const m_QOQ = ref(0)

const sale_count = ref(0)
const sale_thisMonth = ref(0)
const sale_QOQ = ref(0)

const point_count = ref(0)
const point_thisMonth = ref(0)
const point_QOQ = ref(0)

const countCards = computed(() => [
  {
    title: '设备总数',
    value: deviceCount.value,
    unit: '台',
    firstLabel: '在线:',
    firstValue: deviceOnLine.value,
    secondLabel: '离线:',
    secondValue: deviceOffline.value,
    icon: s2,
    iconWidth: 86,
    iconHeight: 69,
    className: 'c1',
    warn: false
  },
  {
    title: '报警总数',
    value: w_count.value,
    unit: '个',
    firstLabel: '运维:',
    firstValue: w_1.value,
    secondLabel: '清运:',
    secondValue: w_2.value,
    icon: s1,
    iconWidth: 80,
    iconHeight: 80,
    className: 'c2',
    warn: true
  },
  {
    title: '会员总数',
    value: m_count.value,
    unit: '人',
    firstLabel: '月增:',
    firstValue: m_thisMonth.value,
    secondLabel: '环比:',
    secondValue: formatPercent(m_QOQ.value),
    icon: s3,
    iconWidth: 78,
    iconHeight: 81,
    className: 'c3',
    warn: false
  },
  {
    title: '销售总数',
    value: sale_count.value,
    unit: '元',
    firstLabel: '月销:',
    firstValue: sale_thisMonth.value,
    secondLabel: '环比:',
    secondValue: formatPercent(sale_QOQ.value),
    icon: s4,
    iconWidth: 62,
    iconHeight: 78,
    className: 'c4',
    warn: false
  },
  {
    title: '积分总数',
    value: point_count.value,
    unit: '分',
    firstLabel: '月发:',
    firstValue: point_thisMonth.value,
    secondLabel: '环比:',
    secondValue: formatPercent(point_QOQ.value),
    icon: s5,
    iconWidth: 77,
    iconHeight: 77,
    className: 'c5',
    warn: false
  }
])
</script>

<style lang="less" scoped>
.count-row {
  width: 100%;
}

.count-col {
  @media (width >= 1200px) {
    max-width: 20%;
    flex: 0 0 20%;
  }
}

.main {
  display: flex;
  flex-direction: column;
  width: 100%;

  .top {
    padding-left: 10px;
    text-align: left;
  }

  .c1 {
    background-image: url('@/assets/imgs/summary-card-device.png');
  }

  .c2 {
    background-image: url('@/assets/imgs/summary-card-warning.png');
  }

  .c3 {
    background-image: url('@/assets/imgs/summary-card-member.png');
  }

  .c4 {
    background-image: url('@/assets/imgs/summary-card-sale.png');
  }

  .c5 {
    background-image: url('@/assets/imgs/summary-card-points.png');
  }

  .content {
    display: flex;
    width: 100%;
    aspect-ratio: 390 / 164;
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    flex-direction: row;
    align-items: center;
    cursor: default;
  }
}

.c_left {
  display: flex;
  width: 34%;
  height: 100%;
  align-items: center;
  justify-content: center;
}

.signPIC {
  display: block;
  width: min(56%, var(--icon-width));
  min-width: 38px;
  height: auto;
  aspect-ratio: var(--icon-width) / var(--icon-height);
  object-fit: contain;
  flex: none;
}

.c_right {
  display: flex;
  flex-direction: column;
  width: 66%;
  height: 100%;
  justify-content: center;
  align-items: center;
}

.cc_top {
  width: 100%;
  font-size: 1.8rem;
  font-weight: 600;
  line-height: 1.35;
  text-align: center;
}

.unit {
  font-size: 0.8rem;
}

.cc_bottom {
  width: 100%;
  font-size: 0.7rem;
  line-height: 1.4;
  text-align: center;

  span + span {
    margin-left: 0.2rem;
  }
}

.ml-2 {
  margin-left: 0.2rem;
}

.is-primary {
  color: blue;
}

.is-danger {
  color: red;
}
</style>
