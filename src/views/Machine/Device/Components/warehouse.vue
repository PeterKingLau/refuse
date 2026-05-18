<template>
  <el-row>
    <el-col :span="8">
      <el-row>
        <img :src="getImageURL('0adecfc2-0367-4be3-9b35-551ad8c24b27.jpg')" class="pic" />
      </el-row>
      <el-row>
        <el-button type="primary" class="btn" @click="test">更改 </el-button>
      </el-row>
    </el-col>
    <el-col :span="16">
      <el-row />
    </el-col>
  </el-row>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { PATH_URL } from '@/config/axios/service'
import { ElMessage } from 'element-plus'

const props = defineProps({
  ruleId: {
    type: Object,
    default: null
  }
})

let id = toRef(props, 'ruleId')

const test = () => {
  ElMessage('id = ' + id.value)
}

//获取图片的地址
const getImageURL = computed(() => (imageURL) => {
  return PATH_URL + '/Common/downLoadPic/' + imageURL
})
</script>

<style scoped>
.pic {
  width: 100px;
  height: 100px;
}

.btn {
  width: 100px;
  margin-top: 5px;
}
</style>
