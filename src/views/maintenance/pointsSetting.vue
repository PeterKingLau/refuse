<template>
  <el-row>
    <el-col :span="8" />
    <el-col :span="8">
      <el-row>
        <el-col :span="12" style="text-align: right; padding-right: 10px">选择运营商</el-col>
        <el-col :span="12" style="text-align: left; padding-left: 10px">
          <el-select v-model="selectDepartment" placeholder="选择" @change="onChange" size="small">
            <el-option
              v-for="item in departmentArray"
              :key="item.id"
              :label="item.platform_name"
              :value="item.id"
            />
          </el-select>
        </el-col>
      </el-row>
    </el-col>
    <el-col :span="8" />
  </el-row>

  <el-divider />
  <el-row>
    <el-col :span="8" />
    <el-col :span="8">
      <el-form :model="settingValue" label-width="260" :rules="rules1" ref="baseForm">
        <el-form-item label="比例类型" prop="proportionalType">
          <el-radio-group v-model="settingValue.proportionalType" class="ml-4">
            <el-radio :label="1">1元</el-radio>
            <el-radio :label="2" disabled>1积分</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="积分提现比例  1元兑换" prop="proportional">
          <el-input
            v-model.number="settingValue.proportional"
            style="max-width: 600px"
            placeholder="请输入"
          >
            <template #append>积分</template>
          </el-input>
        </el-form-item>

        <el-form-item label="单笔最小可提现金额" prop="minimumWithdrawalAmount">
          <el-input
            v-model.number="settingValue.minimumWithdrawalAmount"
            style="max-width: 600px"
            placeholder="请输入"
          >
            <template #prepend>￥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="单笔最大可提现金额" prop="maximumWithdrawalAmount">
          <el-input
            v-model.number="settingValue.maximumWithdrawalAmount"
            style="max-width: 600px"
            placeholder="请输入"
          >
            <template #prepend>￥</template>
          </el-input>
        </el-form-item>

        <el-form-item label="单日最大可提现金额" prop="maximumOfDay">
          <el-input
            v-model.number="settingValue.maximumOfDay"
            style="max-width: 600px"
            placeholder="请输入"
          >
            <template #prepend>￥</template>
          </el-input>
        </el-form-item>
        <el-form-item label="是否限制赠送积分">
          <el-switch v-model="settingValue.canBeGiven" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item label="积分提现配置是否启用">
          <el-switch v-model="settingValue.isEnabled" :active-value="1" :inactive-value="0" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onSubmit">提交</el-button>
        </el-form-item>
      </el-form>
    </el-col>

    <el-col :span="8" />
  </el-row>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue'
import { PATH_URL, service } from '@/config/axios/service'
import { ElSelect, ElMessage, ElMessageBox } from 'element-plus'
import qs from 'qs'

let departmentArray: any = ref([])
let selectDepartment = ref({})
let baseForm: any = ref({})
let settingValue = reactive({
  id: 0,
  proportional: 0,
  proportionalType: 1,
  minimumWithdrawalAmount: 0,
  maximumWithdrawalAmount: 0,
  maximumOfDay: 0,
  isEnabled: 0,
  canBeGiven: 0,
  departmentId: 0
})
const onSubmit = () => {
  baseForm.value.validate((valid) => {
    if (valid) {
      let title = '你确定要保存这个提现设置'
      ElMessageBox.confirm(title, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        saveData()
      })
    } else {
      console.log('验证失败')
    }
  })
}

const saveData = () => {
  let url = '/mem/memPointSwappingRules/savePointSwappingRules'
  service
    .post(
      PATH_URL + url,
      qs.stringify(
        {
          id: settingValue.id,
          proportional: settingValue.proportional,
          proportionalType: settingValue.proportionalType,
          minimumWithdrawalAmount: settingValue.minimumWithdrawalAmount,
          maximumWithdrawalAmount: settingValue.maximumWithdrawalAmount,
          maximumOfDay: settingValue.maximumOfDay,
          isEnabled: settingValue.isEnabled,
          canBeGiven: settingValue.canBeGiven,
          departmentId: settingValue.departmentId
        },
        { arrayFormat: 'brackets' }
      )
    )
    .then((res: any) => {
      if (res.code == 200) {
        ElMessage('保存成功')
      }
    })
}

const rules1 = ref({
  proportionalType: [
    {
      required: true,
      message: '比例类型必须选择',
      trigger: 'blur'
    }
  ],

  proportional: [
    { required: true, message: '积分提现比例 必须输入', trigger: 'blur' },
    { type: 'number', message: '必须是数字', trigger: 'blur' },
    { pattern: /^([1-9]\d{0,4})$/, message: '范围在1 - 99999之间', trigger: 'blur' }
  ],
  minimumWithdrawalAmount: [
    { required: true, message: '单笔最小可提现金额必须输入', trigger: 'blur' },
    { type: 'number', message: '必须是数字', trigger: 'blur' },
    { pattern: /^([1-9]\d{0,4})$/, message: '范围在1 - 99999之间', trigger: 'blur' }
  ],
  maximumWithdrawalAmount: [
    { required: true, message: '单笔最大提现金额必须输入', trigger: 'blur' },
    { type: 'number', message: '必须是数字', trigger: 'blur' },
    { pattern: /^([1-9]\d{0,4})$/, message: '范围在1 - 99999之间', trigger: 'blur' }
  ],
  maximumOfDay: [
    { required: true, message: '每日最大提现金额必须输入', trigger: 'blur' },
    { type: 'number', message: '必须是数字', trigger: 'blur' },
    { pattern: /^([1-9]\d{0,4})$/, message: '范围在1 - 99999之间', trigger: 'blur' }
  ]
})

onMounted(() => {
  getDepartment()
})

let onChange = () => {
  let url =
    '/mem/memPointSwappingRules/getPointSwappingRules?departmentId=' + selectDepartment.value

  service.get(PATH_URL + url).then((res: any) => {
    if (res.data == null) {
      ElMessage({
        showClose: true,
        message: '当前运营商没有设置提现规则，显示默认设置',
        type: 'warning'
      })
      settingValue.id = 0
      settingValue.proportional = 0
      settingValue.proportionalType = 1
      settingValue.minimumWithdrawalAmount = 0
      settingValue.maximumWithdrawalAmount = 0
      settingValue.maximumOfDay = 0
      settingValue.isEnabled = 0
      settingValue.canBeGiven = 0
      settingValue.departmentId = selectDepartment.value as number
    } else {
      settingValue.id = res.data.id
      settingValue.maximumOfDay = res.data.maximumOfDay
      settingValue.maximumWithdrawalAmount = res.data.maximumWithdrawalAmount
      settingValue.minimumWithdrawalAmount = res.data.minimumWithdrawalAmount
      settingValue.proportional = res.data.proportional
      settingValue.proportionalType = res.data.proportionalType
      settingValue.isEnabled = res.data.isEnabled
      settingValue.canBeGiven = res.data.canBeGiven
      settingValue.departmentId = res.data.departmentId
    }
    console.log('res', settingValue)
  })
}

let getDepartment = () => {
  service.get(PATH_URL + '/Permission/getDepartmentForSelect').then((res: any) => {
    if (res.code == 200) {
      departmentArray.value = res.data
      console.log('department', departmentArray)
    }
  })
}
</script>

<style lang="less" scoped></style>
