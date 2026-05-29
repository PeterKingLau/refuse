<template>
  <ARow :gutter="16" class="warehouse-page">
    <ACol :span="8">
      <div class="warehouse-preview">
        <img :src="getImageURL('0adecfc2-0367-4be3-9b35-551ad8c24b27.jpg')" class="pic" />
        <AButton type="primary" class="btn" @click="test">更改</AButton>
      </div>
    </ACol>
    <ACol :span="16"></ACol>
  </ARow>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { Button as AButton, Col as ACol, Row as ARow, message } from 'ant-design-vue'
import { PATH_URL } from '@/config/axios/service'

const props = defineProps({
  ruleId: {
    type: Object,
    default: null
  }
})

const id = toRef(props, 'ruleId')

const test = () => {
  message.info('id = ' + id.value)
}

const getImageURL = (imageURL: string) => {
  return PATH_URL + '/Common/downLoadPic/' + imageURL
}
</script>

<style scoped>
.warehouse-page {
  width: 100%;
}

.warehouse-preview {
  display: inline-flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-start;
}

.pic {
  width: 100px;
  height: 100px;
  object-fit: contain;
}

.btn {
  width: 100px;
}
</style>
