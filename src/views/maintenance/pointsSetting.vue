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
            <AInputNumber v-model:value="settingValue.proportional" :min="1" :max="99999" class="addon-input" placeholder="请输入" />
            <span class="addon-after">积分</span>
          </div>
        </AFormItem>

        <AFormItem label="单笔最小可提现金额" name="minimumWithdrawalAmount" class="inline-form-item">
          <div class="addon-control">
            <span class="addon-before">¥</span>
            <AInputNumber v-model:value="settingValue.minimumWithdrawalAmount" :min="1" :max="99999" class="addon-input" placeholder="请输入" />
          </div>
        </AFormItem>

        <AFormItem label="单笔最大可提现金额" name="maximumWithdrawalAmount" class="inline-form-item">
          <div class="addon-control">
            <span class="addon-before">¥</span>
            <AInputNumber v-model:value="settingValue.maximumWithdrawalAmount" :min="1" :max="99999" class="addon-input" placeholder="请输入" />
          </div>
        </AFormItem>

        <AFormItem label="单日最大可提现金额" name="maximumOfDay" class="inline-form-item">
          <div class="addon-control">
            <span class="addon-before">¥</span>
            <AInputNumber v-model:value="settingValue.maximumOfDay" :min="1" :max="99999" class="addon-input" placeholder="请输入" />
          </div>
        </AFormItem>

        <AFormItem label="是否限制赠送积分" class="inline-form-item">
          <ASwitch :checked="settingValue.canBeGiven === 1" @change="(checked) => setSwitchValue('canBeGiven', checked)" />
        </AFormItem>

        <AFormItem label="积分提现配置是否启用" class="inline-form-item">
          <ASwitch :checked="settingValue.isEnabled === 1" @change="(checked) => setSwitchValue('isEnabled', checked)" />
        </AFormItem>

        <AFormItem class="form-actions">
          <AButton type="primary" @click="onSubmit">提交</AButton>
        </AFormItem>
      </AForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import {
  Button as AButton,
  Divider as ADivider,
  Form as AForm,
  FormItem as AFormItem,
  InputNumber as AInputNumber,
  Modal as AModal,
  RadioGroup as ARadioGroup,
  Select as ASelect,
  Switch as ASwitch,
  message
} from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue'
import qs from 'qs'
import { PATH_URL, service } from '@/config/axios/service'

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
  const url = '/mem/memPointSwappingRules/savePointSwappingRules'
  const res: any = await service.post(
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

  const url = '/mem/memPointSwappingRules/getPointSwappingRules?departmentId=' + selectDepartment.value
  service.get(PATH_URL + url).then((res: any) => {
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

const setSwitchValue = (field: SwitchField, checked: boolean | string | number) => {
  settingValue[field] = checked ? 1 : 0
}

const getDepartment = () => {
  service.get(PATH_URL + '/Permission/getDepartmentForSelect').then((res: any) => {
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
  justify-content: center;
}

.setting-panel {
  width: min(760px, 100%);
  padding: 24px;
  background: #fff;
  border-radius: 6px;
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
    color: #262626;
    font-weight: 500;
  }

  :deep(.ant-form-item-control) {
    min-width: 0;
    flex: 1;
  }
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
  min-width: 42px;
  padding: 0 11px;
  color: #595959;
  background: #fafafa;
  border: 1px solid #d9d9d9;
  align-items: center;
  justify-content: center;
}

.addon-before {
  border-right: 0;
  border-radius: 6px 0 0 6px;
}

.addon-after {
  border-left: 0;
  border-radius: 0 6px 6px 0;
}

.form-actions {
  :deep(.ant-form-item-control) {
    margin-left: 220px;
  }
}
</style>
