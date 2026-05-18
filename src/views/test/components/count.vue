<template>
  <el-row>
    <div class="main">
      <div class="top"> 设备总数> </div>
      <div class="content c1">
        <div class="c_left"> <img src="@/assets/imgs/s2.png" class="signPIC" /> </div>
        <div class="c_right">
          <div class="cc_top"> {{ deviceCount }}<span style="font-size: 0.8rem">台</span> </div>
          <div class="cc_bottom">
            <span> 在线：</span
            ><span style="margin-left: 0.2rem; color: blue">{{ deviceOnLine }}</span>
            <span style="margin-left: 0.2rem">离线:</span>
            <span style="margin-left: 0.2rem; color: blue">{{ deviceOffline }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="main">
      <div class="top"> 报警总数> </div>
      <div class="content c2">
        <div class="c_left"> <img src="@/assets/imgs/s1.png" class="signPIC" /> </div>
        <div class="c_right">
          <div class="cc_top"> {{ w_count }}<span style="font-size: 0.8rem">个</span> </div>
          <div class="cc_bottom">
            <span> 运维：</span><span style="margin-left: 0.2rem; color: red">{{ w_1 }}</span>
            <span style="margin-left: 0.2rem">清运:</span>
            <span style="margin-left: 0.2rem; color: red">{{ w_2 }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="main">
      <div class="top"> 会员总数> </div>
      <div class="content c3">
        <div class="c_left"> <img src="@/assets/imgs/s3.png" class="signPIC" /> </div>
        <div class="c_right">
          <div class="cc_top"> {{ m_count }}<span style="font-size: 0.8rem">人</span> </div>
          <div class="cc_bottom">
            <span> 月增：</span
            ><span style="margin-left: 0.2rem; color: blue">{{ m_thisMonth }}</span>
            <span style="margin-left: 0.2rem">环比:</span>
            <span style="margin-left: 0.3rem; color: blue">{{ m_QOQ }} %</span>
          </div>
        </div>
      </div>
    </div>

    <div class="main">
      <div class="top"> 销售总数> </div>
      <div class="content c4">
        <div class="c_left"> <img src="@/assets/imgs/s4.png" class="signPIC" /> </div>
        <div class="c_right">
          <div class="cc_top"> {{ sale_count }}<span style="font-size: 0.8rem">元</span> </div>
          <div class="cc_bottom">
            <span> 月销：</span
            ><span style="margin-left: 0.2rem; color: blue">{{ sale_thisMonth }}</span>
            <span style="margin-left: 0.2rem">环比:</span>
            <span style="margin-left: 0.2rem; color: blue">{{ sale_QOQ }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="main">
      <div class="top"> 积分总数> </div>
      <div class="content c5">
        <div class="c_left"> <img src="@/assets/imgs/s5.png" class="signPIC" /> </div>
        <div class="c_right">
          <div class="cc_top"> {{ point_count }}<span style="font-size: 0.8rem">分</span> </div>
          <div class="cc_bottom">
            <span> 月发：</span
            ><span style="margin-left: 0.2rem; color: blue">{{ point_thisMonth }}</span>
            <span style="margin-left: 0.2rem">环比:</span>
            <span style="margin-left: 0.2rem; color: blue">{{ point_QOQ }}%</span>
          </div>
        </div>
      </div>
    </div>
  </el-row>
</template>

<script setup lang="ts">
import { PATH_URL, service } from '@/config/axios/service'
import { ref, onMounted } from 'vue'

onMounted(() => {
  getDeviceData()
  getWarningData()
  getMemberCount()
  getPointsData()
})

const getPointsData = () => {
  service.get(PATH_URL + '/MachineMange/GetPointCount').then((res: any) => {
    point_count.value = res.data.count
    point_thisMonth.value = res.data.thisMonth
    point_QOQ.value = res.data.QOQ
  })
}

const getMemberCount = () => {
  service.get(PATH_URL + '/MachineMange/GetMemberCount').then((res: any) => {
    m_count.value = res.data.count
    m_thisMonth.value = res.data.thisMonth
    m_QOQ.value = res.data.QOQ
  })
}

const getDeviceData = () => {
  service.get(PATH_URL + '/MachineMange/GetDeviceCount').then((res: any) => {
    deviceCount.value = res.data.cc
    deviceOffline.value = res.data.off
    deviceOnLine.value = res.data.on
  })
}

const getWarningData = () => {
  service.get(PATH_URL + '/MachineMange/GetWarningCount').then((res: any) => {
    w_count.value = res.data.count
    w_1.value = res.data.w1
    w_2.value = res.data.w2
  })
}

//设备总数
let deviceCount = ref(0)
//设备在线数
let deviceOnLine = ref(0)
//设备离线数
let deviceOffline = ref(0)

let w_count = ref(0)
let w_1 = ref(0)
let w_2 = ref(0)

let m_count = ref(0)
let m_thisMonth = ref(0)
let m_QOQ = ref(0)

let sale_count = ref(0)
let sale_thisMonth = ref(0)
let sale_QOQ = ref(0)

let point_count = ref(0)
let point_thisMonth = ref(0)
let point_QOQ = ref(0)
</script>

<style lang="less" scoped>
.main {
  display: flex;
  flex-direction: column;
  width: 19rem;
  margin-left: 20px;

  .top {
    padding-left: 10px;
    text-align: left;
  }

  .c1 {
    background-image: url(@/assets/imgs/圆角矩形1.png);
  }

  .c2 {
    background-image: url(@/assets/imgs/圆角矩形5.png);
  }

  .c3 {
    background-image: url(@/assets/imgs/圆角矩形2.png);
  }

  .c4 {
    background-image: url(@/assets/imgs/圆角矩形4.png);
  }

  .c5 {
    background-image: url(@/assets/imgs/圆角矩形3.png);
  }

  .content {
    display: flex;
    width: 100%;
    height: 5rem;

    background-size: 100% 100%;
    flex-direction: row;
  }
}

.c_left {
  width: 8rem;
  height: 100%;
}

.signPIC {
  width: 3.5rem;
  height: 2.5rem;
  margin-top: 18%;
  margin-left: 30%;
}

.c_right {
  display: flex;
  flex-direction: column;
  width: 100%;
  justify-content: center;
  align-items: center;
}

.cc_top {
  width: 100%;
  height: 70%;
  font-size: 1.8rem;
  font-weight: 600;
  //   background-color: aqua;
  text-align: center;
}

.cc_bottom {
  width: 100%;
  height: 30%;
  font-size: 0.7rem;
  //   background-color: yellowgreen;
  text-align: center;
}
</style>
