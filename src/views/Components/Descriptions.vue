<script setup lang="ts">
import { Descriptions } from '@/components/Descriptions'
import { useI18n } from '@/hooks/web/useI18n'
import { reactive, unref } from 'vue'
import { Form } from '@/components/Form'
import { Button as AButton, FormItem as AFormItem, Input as AInput } from 'ant-design-vue'
import { useValidator } from '@/hooks/web/useValidator'
import { useForm } from '@/hooks/web/useForm'
import { DescriptionsSchema } from '@/types/descriptions'

const { required } = useValidator()

const { t } = useI18n()

const data = reactive({
  username: 'chenkl',
  nickName: '梦里花落',
  age: 26,
  phone: '13655971xxxx',
  email: '502431556@qq.com',
  addr: '这是一个很长很长很长很长很长很长很长很长很长很长很长很长的地址',
  sex: '男',
  certy: '3505831994xxxxxxxx'
})

const schema = reactive<DescriptionsSchema[]>([
  {
    field: 'username',
    label: t('descriptionsDemo.username')
  },
  {
    field: 'nickName',
    label: t('descriptionsDemo.nickName')
  },
  {
    field: 'phone',
    label: t('descriptionsDemo.phone')
  },
  {
    field: 'email',
    label: t('descriptionsDemo.email')
  },
  {
    field: 'addr',
    label: t('descriptionsDemo.addr'),
    span: 24
  }
])

const form = reactive({
  username: '',
  nickName: '',
  phone: '',
  email: '',
  addr: ''
})

const rules = reactive({
  username: [required()],
  nickName: [required()],
  phone: [required()],
  email: [required()],
  addr: [required()]
})

const { register, elFormRef } = useForm()

const formValidation = () => {
  unref(elFormRef)!.validate((isValid) => {
    console.log(isValid)
  })
}
</script>

<template>
  <Descriptions :title="t('descriptionsDemo.descriptions')" :message="t('descriptionsDemo.descriptionsDes')" :data="data" :schema="schema" />

  <Form is-custom :model="form" :rules="rules" @register="register">
    <Descriptions :title="t('descriptionsDemo.form')" :data="data" :schema="schema" class="mt-20px">
      <template #username-label="scope">
        <span class="is-required--item">{{ scope.label }}</span>
      </template>
      <template #nickName-label="scope">
        <span class="is-required--item">{{ scope.label }}</span>
      </template>
      <template #phone-label="scope">
        <span class="is-required--item">{{ scope.label }}</span>
      </template>
      <template #email-label="scope">
        <span class="is-required--item">{{ scope.label }}</span>
      </template>
      <template #addr-label="scope">
        <span class="is-required--item">{{ scope.label }}</span>
      </template>

      <template #username>
        <AFormItem name="username">
          <AInput v-model:value="form.username" />
        </AFormItem>
      </template>
      <template #nickName>
        <AFormItem name="nickName">
          <AInput v-model:value="form.nickName" />
        </AFormItem>
      </template>
      <template #phone>
        <AFormItem name="phone">
          <AInput v-model:value="form.phone" />
        </AFormItem>
      </template>
      <template #email>
        <AFormItem name="email">
          <AInput v-model:value="form.email" />
        </AFormItem>
      </template>
      <template #addr>
        <AFormItem name="addr">
          <AInput v-model:value="form.addr" />
        </AFormItem>
      </template>
    </Descriptions>
    <div class="text-center mt-10px">
      <AButton @click="formValidation"> {{ t('formDemo.formValidation') }} </AButton>
    </div>
  </Form>
</template>

<style lang="less" scoped>
.is-required--item {
  position: relative;

  &::before {
    margin-right: 4px;
    color: var(--app-color-danger);
    content: '*';
  }
}
</style>
