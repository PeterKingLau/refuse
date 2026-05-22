<template>
  <el-row>
    <el-col :span="10" />
    <el-col :span="14">
      <el-form>
        <el-row>
          <el-form-item label="菜单标题">
            <el-input :v-model="formData.name" />
          </el-form-item>
        </el-row>
      </el-form>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, reactive } from 'vue'

//#region  数据定义
const formData = reactive({
  id: 0,
  path: '',
  name: '',
  component: '',
  redirect: '',
  parent_id: 0,
  soft: 0,
  sign: '',
  status: 0,
  icon: '',
  title: ''
})

//#endregion
</script>
<style lang="less" scoped></style>
