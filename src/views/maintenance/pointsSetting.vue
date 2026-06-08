<template>
  <div class="points-setting-page">
    <div class="setting-panel">
      <AForm layout="horizontal" class="department-form">
        <AFormItem label="选择运营商" class="inline-form-item">
          <ASelect v-model:value="selectDepartment" :options="departmentOptions" placeholder="请选择运营商" class="form-control" @change="onChange" />
        </AFormItem>
      </AForm>

      <ADivider />

      <AForm ref="baseForm" :model="settingValue" :rules="rules" layout="horizontal" class="setting-form">
        <AFormItem label="比例类型" name="proportionalType" class="inline-form-item">
          <ARadioGroup v-model:value="settingValue.proportionalType" :options="proportionalTypeOptions" option-type="button" button-style="solid" />
        </AFormItem>

        <AFormItem label="积分提现比例 1元兑换" name="proportional" class="inline-form-item">
          <div class="addon-control">
            <AInput
              :value="getNumberInputValue(settingValue.proportional)"
              inputmode="numeric"
              pattern="[0-9]*"
              :maxlength="5"
              class="addon-input"
              placeholder="请输入"
              @update:value="(value) => setNumberInputValue('proportional', value)"
            />
            <span class="addon-after">积分</span>
          </div>
        </AFormItem>

        <AFormItem label="单笔最小可提现金额" name="minimumWithdrawalAmount" class="inline-form-item">
          <div class="addon-control">
            <span class="addon-before">¥</span>
            <AInput
              :value="getNumberInputValue(settingValue.minimumWithdrawalAmount)"
              inputmode="numeric"
              pattern="[0-9]*"
              :maxlength="5"
              class="addon-input"
              placeholder="请输入"
              @update:value="(value) => setNumberInputValue('minimumWithdrawalAmount', value)"
            />
          </div>
        </AFormItem>

        <AFormItem label="单笔最大可提现金额" name="maximumWithdrawalAmount" class="inline-form-item">
          <div class="addon-control">
            <span class="addon-before">¥</span>
            <AInput
              :value="getNumberInputValue(settingValue.maximumWithdrawalAmount)"
              inputmode="numeric"
              pattern="[0-9]*"
              :maxlength="5"
              class="addon-input"
              placeholder="请输入"
              @update:value="(value) => setNumberInputValue('maximumWithdrawalAmount', value)"
            />
          </div>
        </AFormItem>

        <AFormItem label="单日最大可提现金额" name="maximumOfDay" class="inline-form-item">
          <div class="addon-control">
            <span class="addon-before">¥</span>
            <AInput
              :value="getNumberInputValue(settingValue.maximumOfDay)"
              inputmode="numeric"
              pattern="[0-9]*"
              :maxlength="5"
              class="addon-input"
              placeholder="请输入"
              @update:value="(value) => setNumberInputValue('maximumOfDay', value)"
            />
          </div>
        </AFormItem>

        <AFormItem label="是否限制赠送积分" class="inline-form-item">
          <ASwitch :checked="settingValue.canBeGiven === 1" @change="(checked) => setSwitchValue('canBeGiven', checked)" />
        </AFormItem>

        <AFormItem label="积分提现配置是否启用" class="inline-form-item">
          <ASwitch :checked="settingValue.isEnabled === 1" @change="(checked) => setSwitchValue('isEnabled', checked)" />
        </AFormItem>

        <AFormItem class="form-actions">
          <div class="action-buttons">
            <AButton type="primary" @click="onSubmit">提交</AButton>
            <AButton @click="onReset">重置</AButton>
          </div>
        </AFormItem>
      </AForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { getDepartmentForSelectApi } from '@/api/permission'
import { getPointSwappingRulesApi, savePointSwappingRulesApi } from '@/api/maintenance/pointsSetting'

import { computed, onMounted, reactive, ref } from 'vue'
import {
  Button as AButton,
  Divider as ADivider,
  Form as AForm,
  FormItem as AFormItem,
  Input as AInput,
  Modal as AModal,
  RadioGroup as ARadioGroup,
  Select as ASelect,
  Switch as ASwitch,
  message
} from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import qs from 'qs'

interface DepartmentStruct {
  id: number
  platform_name: string
}

interface SettingValueStruct {
  id: number
  proportional: number
  proportionalType: number
  minimumWithdrawalAmount: number
  maximumWithdrawalAmount: number
  maximumOfDay: number
  isEnabled: number
  canBeGiven: number
  departmentId: number
}

type SwitchField = 'canBeGiven' | 'isEnabled'
type NumberField = 'proportional' | 'minimumWithdrawalAmount' | 'maximumWithdrawalAmount' | 'maximumOfDay'

const departmentArray = ref<DepartmentStruct[]>([])
const selectDepartment = ref<number>()
const baseForm = ref<FormInstance>()

const settingValue = reactive<SettingValueStruct>({
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

const departmentOptions = computed(() => departmentArray.value.map((item) => ({ label: item.platform_name, value: item.id })))

const proportionalTypeOptions = [
  { label: '1元', value: 1 },
  { label: '1积分', value: 2, disabled: true }
]

const numberRangeRule = (requiredMessage: string) => [
  { required: true, message: requiredMessage, trigger: 'change' },
  {
    validator: async (_rule: unknown, value: number) => {
      if (!Number.isInteger(Number(value)) || Number(value) < 1 || Number(value) > 99999) {
        return Promise.reject(new Error('范围在 1 - 99999 之间'))
      }
      return Promise.resolve()
    },
    trigger: 'change'
  }
]

const rules: Record<string, any[]> = {
  proportionalType: [{ required: true, message: '比例类型必须选择', trigger: 'change' }],
  proportional: numberRangeRule('积分提现比例必须输入'),
  minimumWithdrawalAmount: numberRangeRule('单笔最小可提现金额必须输入'),
  maximumWithdrawalAmount: numberRangeRule('单笔最大可提现金额必须输入'),
  maximumOfDay: numberRangeRule('单日最大可提现金额必须输入')
}

const getNumberInputValue = (value: number) => {
  return value ? String(value) : ''
}

const setNumberInputValue = (field: NumberField, value: string) => {
  const normalizedValue = String(value || '')
    .replace(/\D/g, '')
    .slice(0, 5)

  settingValue[field] = normalizedValue ? Number(normalizedValue) : 0
}

const onSubmit = () => {
  baseForm.value
    ?.validate()
    .then(() => {
      AModal.confirm({
        title: '提示',
        content: '确定要保存这个提现设置吗？',
        okText: '确定',
        cancelText: '取消',
        onOk: saveData
      })
    })
    .catch(() => {
      console.log('验证失败')
    })
}

const saveData = async () => {
  const res: any = await savePointSwappingRulesApi(
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

  if (res.code == 200) {
    message.success('保存成功')
  }
}

const resetSettingValue = (departmentId: number) => {
  settingValue.id = 0
  settingValue.proportional = 0
  settingValue.proportionalType = 1
  settingValue.minimumWithdrawalAmount = 0
  settingValue.maximumWithdrawalAmount = 0
  settingValue.maximumOfDay = 0
  settingValue.isEnabled = 0
  settingValue.canBeGiven = 0
  settingValue.departmentId = departmentId
}

const onChange = () => {
  if (!selectDepartment.value) return

  getPointSwappingRulesApi(selectDepartment.value).then((res: any) => {
    if (res.data == null) {
      message.warning('当前运营商没有设置提现规则，显示默认设置')
      resetSettingValue(selectDepartment.value as number)
      return
    }

    settingValue.id = res.data.id
    settingValue.maximumOfDay = res.data.maximumOfDay
    settingValue.maximumWithdrawalAmount = res.data.maximumWithdrawalAmount
    settingValue.minimumWithdrawalAmount = res.data.minimumWithdrawalAmount
    settingValue.proportional = res.data.proportional
    settingValue.proportionalType = res.data.proportionalType
    settingValue.isEnabled = res.data.isEnabled
    settingValue.canBeGiven = res.data.canBeGiven
    settingValue.departmentId = res.data.departmentId
  })
}

const onReset = () => {
  if (selectDepartment.value) {
    onChange()
    return
  }

  baseForm.value?.clearValidate()
  resetSettingValue(0)
}

const setSwitchValue = (field: SwitchField, checked: boolean | string | number) => {
  settingValue[field] = checked ? 1 : 0
}

const getDepartment = () => {
  getDepartmentForSelectApi().then((res: any) => {
    if (res.code == 200) {
      departmentArray.value = res.data || []
    }
  })
}

onMounted(() => {
  getDepartment()
})
</script>

<style lang="less" scoped>
.points-setting-page {
  display: flex;
  width: 100%;
  padding: 24px 0;
  color: var(--app-text-color-regular);
  justify-content: center;
}

.setting-panel {
  width: min(760px, 100%);
  padding: 0;
  background: transparent;
}

.department-form,
.setting-form {
  :deep(.ant-form-item) {
    display: flex;
    margin-bottom: 18px;
    align-items: center;
    flex-wrap: nowrap;
  }

  :deep(.ant-form-item-label) {
    flex: 0 0 220px;
    padding: 0 16px 0 0;
    line-height: 1;
    text-align: right;
    white-space: nowrap;
  }

  :deep(.ant-form-item-label > label) {
    height: 32px;
    color: var(--app-text-color-regular);
    font-weight: 500;
  }

  :deep(.ant-form-item-control) {
    min-width: 0;
    flex: 1;
  }
}

.department-form {
  margin-bottom: 18px;
}

.setting-form {
  padding-top: 6px;
}

:deep(.ant-divider) {
  margin: 20px 0;
  border-color: var(--app-border-color);
}

.inline-form-item,
.form-actions {
  min-width: 0;
}

.form-control {
  width: 100%;
}

.addon-control {
  display: flex;
  width: 100%;
}

.addon-input {
  flex: 1;
}

.addon-before,
.addon-after {
  display: inline-flex;
  min-width: 28px;
  padding: 0 8px;
  color: var(--app-text-color-secondary);
  align-items: center;
  justify-content: center;
}

.addon-before {
  padding-left: 0;
}

.addon-after {
  justify-content: flex-start;
}

.form-actions {
  :deep(.ant-form-item-control) {
    margin-left: 220px;
  }
}

.action-buttons {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}
</style>
