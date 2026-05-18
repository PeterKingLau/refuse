<template>
  <el-row>
    <count />
  </el-row>
  <el-row class="m_top">
    <el-col :span="12">
      <div class="member">
        <memberIncrement ref="memberRef" />
      </div>
    </el-col>
    <el-col :span="12">
      <div class="member">
        <saleStatis ref="saleRef" />
      </div>
    </el-col>
  </el-row>
  <el-row class="m_top">
    <el-col :span="12">
      <div class="member">
        <pointsStatus ref="pointsRef" />
      </div>
    </el-col>
    <el-col :span="12">
      <div class="member">
        <orderStatis ref="orderStatisRef" />
      </div>
    </el-col>
  </el-row>
  <el-row class="m_top">
    <div class="member">
      <deviceStatis ref="deviceStatis" />
    </div>
  </el-row>
</template>

<script setup lang="ts">
import memberIncrement from './components/memberIncrement.vue'
import pointsStatus from './components/pointsStatus.vue'
import orderStatis from './components/orderStatis.vue'
import deviceStatis from './components/deviceStatis.vue'
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
