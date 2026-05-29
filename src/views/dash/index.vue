<template>
  <ARow>
    <ACol :span="24">
      <count />
    </ACol>
  </ARow>
  <ARow class="m_top" :gutter="[16, 16]">
    <ACol :xs="24" :lg="12">
      <div class="member">
        <memberIncrement ref="memberRef" />
      </div>
    </ACol>
    <ACol :xs="24" :lg="12">
      <div class="member">
        <saleStatis ref="saleRef" />
      </div>
    </ACol>
  </ARow>
  <ARow class="m_top" :gutter="[16, 16]">
    <ACol :xs="24" :lg="12">
      <div class="member">
        <pointsStatus ref="pointsRef" />
      </div>
    </ACol>
    <ACol :xs="24" :lg="12">
      <div class="member">
        <orderStatis ref="orderStatisRef" />
      </div>
    </ACol>
  </ARow>
  <ARow class="m_top">
    <ACol :span="24">
      <div class="member">
        <DeviceStatis />
      </div>
    </ACol>
  </ARow>
</template>

<script setup lang="ts">
import { Col as ACol, Row as ARow } from 'ant-design-vue'
import memberIncrement from './components/memberIncrement.vue'
import pointsStatus from './components/pointsStatus.vue'
import orderStatis from './components/orderStatis.vue'
import DeviceStatis from './components/deviceStatis.vue'
import count from './components/count.vue'
import saleStatis from './components/saleStatis.vue'
</script>

<style lang="less" scoped>
.member {
  width: 100%;
}

.m_top {
  margin-top: 10px;
}
</style>
