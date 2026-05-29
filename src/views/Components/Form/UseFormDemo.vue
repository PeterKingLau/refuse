<script setup lang="ts">
import { Form } from '@/components/Form'
import { ContentWrap } from '@/components/ContentWrap'
import { useI18n } from '@/hooks/web/useI18n'
import { useForm } from '@/hooks/web/useForm'
import { reactive, unref, ref } from 'vue'
import { Button as AButton } from 'ant-design-vue'
import { useValidator } from '@/hooks/web/useValidator'
import { getDictOneApi } from '@/api/common'
import { FormSchema } from '@/types/form'

const { required } = useValidator()

const { t } = useI18n()

const schema = reactive<FormSchema[]>([
  {
    field: 'field1',
    label: t('formDemo.input'),
    component: 'Input',
    formItemProps: {
      rules: [required()]
    }
  },
  {
    field: 'field2',
    label: t('formDemo.select'),
    component: 'Select',
    componentProps: {
      options: [
        {
          label: 'option1',
          value: '1'
        },
        {
          label: 'option2',
          value: '2'
        }
      ]
    }
  },
  {
    field: 'field3',
    label: t('formDemo.radio'),
    component: 'Radio',
    componentProps: {
      options: [
        {
          label: 'option-1',
          value: '1'
        },
        {
          label: 'option-2',
          value: '2'
        }
      ]
    }
  },
  {
    field: 'field4',
    label: t('formDemo.checkbox'),
    component: 'Checkbox',
    value: [],
    componentProps: {
      options: [
        {
          label: 'option-1',
          value: '1'
        },
        {
          label: 'option-2',
          value: '2'
        },
        {
          label: 'option-3',
          value: '3'
        }
      ]
    }
  },
  {
    field: 'field5',
    component: 'DatePicker',
    label: t('formDemo.datePicker'),
    componentProps: {
      type: 'date'
    }
  },
  {
    field: 'field6',
    component: 'TimeSelect',
    label: t('formDemo.timeSelect')
  }
])

const { register, methods, elFormRef } = useForm({
  schema
})

const changeLabelWidth = (width: number | string) => {
  const { setProps } = methods
  setProps({
    labelWidth: width
  })
}

const changeSize = (size: string) => {
  const { setProps } = methods
  setProps({
    size
  })
}

const changeDisabled = (bool: boolean) => {
  const { setProps } = methods
  setProps({
    disabled: bool
  })
}

const changeSchema = (del: boolean) => {
  const { delSchema, addSchema } = methods
  if (del) {
    delSchema('field2')
  } else if (!del && schema[1].field !== 'field2') {
    addSchema(
      {
        field: 'field2',
        label: t('formDemo.select'),
        component: 'Select',
        componentProps: {
          options: [
            {
              label: 'option1',
              value: '1'
            },
            {
              label: 'option2',
              value: '2'
            }
          ]
        }
      },
      1
    )
  }
}

const setValue = (reset: boolean) => {
  const { setValues } = methods
  if (reset) {
    unref(elFormRef)?.resetFields()
  } else {
    setValues({
      field1: 'field1',
      field2: '2',
      field3: '2',
      field4: ['1', '3'],
      field5: '2022-01-27',
      field6: '17:00'
    })
  }
}

const index = ref(7)

const setLabel = () => {
  const { setSchema } = methods
  setSchema([
    {
      field: 'field2',
      path: 'label',
      value: `${t('formDemo.select')} ${index.value}`
    },
    {
      field: 'field2',
      path: 'componentProps.options',
      value: [
        {
          label: 'option-1',
          value: '1'
        },
        {
          label: 'option-2',
          value: '2'
        },
        {
          label: 'option-3',
          value: '3'
        }
      ]
    }
  ])
  index.value++
}

const addItem = () => {
  const { addSchema } = methods
  if (unref(index) % 2 === 0) {
    addSchema({
      field: `field${unref(index)}`,
      label: `${t('formDemo.input')}${unref(index)}`,
      component: 'Input'
    })
  } else {
    addSchema(
      {
        field: `field${unref(index)}`,
        label: `${t('formDemo.input')}${unref(index)}`,
        component: 'Input'
      },
      unref(index)
    )
  }
  index.value++
}

const formValidation = () => {
  unref(elFormRef)!.validate((isValid) => {
    console.log(isValid)
  })
}

const verifyReset = () => {
  unref(elFormRef)?.resetFields()
}

const getDictOne = async () => {
  const res = await getDictOneApi()
  if (res) {
    const { setSchema } = methods
    setSchema([
      {
        field: 'field2',
        path: 'componentProps.options',
        value: res.data
      }
    ])
  }
}
</script>

<template>
  <ContentWrap :title="`UseForm ${t('formDemo.operate')}`">
    <AButton @click="changeLabelWidth(150)">{{ t('formDemo.change') }} labelWidth</AButton>
    <AButton @click="changeLabelWidth('auto')">{{ t('formDemo.restore') }} labelWidth</AButton>

    <AButton @click="changeSize('large')">{{ t('formDemo.change') }} size</AButton>
    <AButton @click="changeSize('default')">{{ t('formDemo.restore') }} size</AButton>

    <AButton @click="changeDisabled(true)">{{ t('formDemo.disabled') }}</AButton>
    <AButton @click="changeDisabled(false)">{{ t('formDemo.disablement') }}</AButton>

    <AButton @click="changeSchema(true)"> {{ t('formDemo.delete') }} {{ t('formDemo.select') }} </AButton>
    <AButton @click="changeSchema(false)"> {{ t('formDemo.add') }} {{ t('formDemo.select') }} </AButton>

    <AButton @click="setValue(false)">{{ t('formDemo.setValue') }}</AButton>
    <AButton @click="setValue(true)">{{ t('formDemo.resetValue') }}</AButton>

    <AButton @click="setLabel"> {{ t('formDemo.set') }} {{ t('formDemo.select') }} label </AButton>

    <AButton @click="addItem"> {{ t('formDemo.add') }} {{ t('formDemo.subitem') }} </AButton>

    <AButton @click="formValidation"> {{ t('formDemo.formValidation') }} </AButton>
    <AButton @click="verifyReset"> {{ t('formDemo.verifyReset') }} </AButton>

    <AButton @click="getDictOne">
      {{ t('searchDemo.dynamicOptions') }}
    </AButton>
  </ContentWrap>
  <ContentWrap :title="`UseForm ${t('formDemo.example')}`">
    <Form @register="register" />
  </ContentWrap>
</template>
