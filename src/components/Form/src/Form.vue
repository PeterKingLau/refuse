<script lang="tsx">
import { PropType, defineComponent, ref, computed, unref, watch, onMounted } from 'vue'
import { Col as ACol, Form as AForm, FormItem as AFormItem, Row as ARow, Tooltip as ATooltip } from 'ant-design-vue'
import type { FormInstance } from 'ant-design-vue/es/form'
import type { CompatibleFormInstance, FormValidateCallback } from '@/components/Form'
import { componentMap } from './componentMap'
import { propTypes } from '@/utils/propTypes'
import { getSlot } from '@/utils/tsxHelper'
import { setTextPlaceholder, setGridProp, setComponentProps, setItemComponentSlots, initModel, setFormItemSlots } from './helper'
import { useRenderSelect } from './components/useRenderSelect'
import { useRenderRadio } from './components/useRenderRadio'
import { useRenderCheckbox } from './components/useRenderCheckbox'
import { useDesign } from '@/hooks/web/useDesign'
import { findIndex } from '@/utils'
import { set } from 'lodash-es'
import type { FormProps } from './types'
import { Icon } from '@/components/Icon'
import type { FormSchema, FormSetPropsType } from '@/types/form'

const { getPrefixCls } = useDesign()

const prefixCls = getPrefixCls('form')

const toSizeUnit = (value?: string | number) => {
  if (value === undefined || value === '' || value === 'auto') return undefined
  return typeof value === 'number' ? `${value}px` : value
}

export default defineComponent({
  name: 'Form',
  props: {
    schema: {
      type: Array as PropType<FormSchema[]>,
      default: () => []
    },
    isCol: propTypes.bool.def(true),
    model: {
      type: Object as PropType<Recordable>,
      default: () => ({})
    },
    autoSetPlaceholder: propTypes.bool.def(true),
    isCustom: propTypes.bool.def(false),
    labelWidth: propTypes.oneOfType([String, Number]).def('auto')
  },
  emits: ['register'],
  setup(props, { slots, expose, emit }) {
    const elFormRef = ref<FormInstance>()

    const outsideProps = ref<FormProps>({})

    const mergeProps = ref<FormProps>({})

    const getProps = computed(() => {
      const propsObj = { ...props }
      Object.assign(propsObj, unref(mergeProps))
      return propsObj
    })

    const formModel = ref<Recordable>({})

    const getCompatibleFormRef = (): CompatibleFormInstance => {
      const form = unref(elFormRef) as FormInstance

      return {
        ...form,
        validate: async (nameListOrCallback?: Parameters<FormInstance['validate']>[0] | FormValidateCallback, options?: Parameters<FormInstance['validate']>[1]) => {
          if (typeof nameListOrCallback === 'function') {
            try {
              await form.validate()
              nameListOrCallback(true)
              return true
            } catch (error) {
              nameListOrCallback(false, error)
              return false
            }
          }

          return form.validate(nameListOrCallback, options)
        },
        resetFields: form.resetFields.bind(form),
        clearValidate: form.clearValidate.bind(form),
        validateFields: form.validateFields.bind(form),
        scrollToField: form.scrollToField?.bind(form)
      } as CompatibleFormInstance
    }

    onMounted(() => {
      emit('register', unref(elFormRef)?.$parent, getCompatibleFormRef())
    })

    const setValues = (data: Recordable = {}) => {
      formModel.value = Object.assign(unref(formModel), data)
    }

    const setProps = (props: FormProps = {}) => {
      mergeProps.value = Object.assign(unref(mergeProps), props)
      outsideProps.value = props
    }

    const delSchema = (field: string) => {
      const { schema } = unref(getProps)

      const index = findIndex(schema, (v: FormSchema) => v.field === field)
      if (index > -1) {
        schema.splice(index, 1)
      }
    }

    const addSchema = (formSchema: FormSchema, index?: number) => {
      const { schema } = unref(getProps)
      if (index !== void 0) {
        schema.splice(index, 0, formSchema)
        return
      }
      schema.push(formSchema)
    }

    const setSchema = (schemaProps: FormSetPropsType[]) => {
      const { schema } = unref(getProps)
      for (const v of schema) {
        for (const item of schemaProps) {
          if (v.field === item.field) {
            set(v, item.path, item.value)
          }
        }
      }
    }

    const getElFormRef = (): CompatibleFormInstance => {
      return getCompatibleFormRef()
    }

    expose({
      setValues,
      formModel,
      setProps,
      delSchema,
      addSchema,
      setSchema,
      getElFormRef
    })

    watch(
      () => unref(getProps).schema,
      (schema = []) => {
        formModel.value = initModel(schema, unref(formModel))
      },
      {
        immediate: true,
        deep: true
      }
    )

    const renderWrap = () => {
      const { isCol } = unref(getProps)
      return isCol ? <ARow gutter={20}>{renderFormItemWrap()}</ARow> : renderFormItemWrap()
    }

    const renderFormItemWrap = () => {
      const { schema = [], isCol } = unref(getProps)

      return schema
        .filter((v) => !v.hidden)
        .map((item) => {
          const isDivider = item.component === 'Divider'
          const Com = componentMap['Divider'] as ReturnType<typeof defineComponent>
          const { contentPosition, ...dividerProps } = item.componentProps || {}

          return isDivider ? (
            <Com {...dividerProps} orientation={contentPosition || 'left'}>
              {item?.label}
            </Com>
          ) : isCol ? (
            <ACol {...setGridProp(item.colProps)}>{renderFormItem(item)}</ACol>
          ) : (
            renderFormItem(item)
          )
        })
    }

    const getModelBind = (item: FormSchema) => {
      const value = formModel.value[item.field]
      const updateValue = (val: unknown) => {
        formModel.value[item.field] = val
      }

      if (item.component === 'Switch') {
        return {
          checked: value,
          'onUpdate:checked': updateValue
        }
      }

      if (item.component === 'InputPassword' || item.component === 'Editor') {
        return {
          modelValue: value,
          'onUpdate:modelValue': updateValue
        }
      }

      if (item.component === 'Transfer') {
        return {
          targetKeys: value,
          'onUpdate:targetKeys': updateValue
        }
      }

      return {
        value,
        'onUpdate:value': updateValue
      }
    }

    const getFormItemProps = (item: FormSchema) => {
      const { labelWidth, ...formItemProps } = item.formItemProps || {}
      const width = toSizeUnit(labelWidth)

      return {
        ...formItemProps,
        ...(width ? { labelCol: { style: { width } } } : {}),
        name: item.field,
        label: item.label || ''
      }
    }

    const renderFormItem = (item: FormSchema) => {
      const notRenderOptions = ['SelectV2', 'Cascader', 'Transfer']
      const slotsMap: Recordable = {
        ...setItemComponentSlots(slots, item?.componentProps?.slots, item.field)
      }
      if (item?.component !== 'SelectV2' && item?.component !== 'Cascader' && item?.componentProps?.options) {
        slotsMap.default = () => renderOptions(item)
      }

      const formItemSlots: Recordable = setFormItemSlots(slots, item.field)
      if (item?.labelMessage) {
        formItemSlots.label = () => {
          return (
            <>
              <span>{item.label}</span>
              <ATooltip placement="right">
                {{
                  title: () => <span innerHTML={item.labelMessage}></span>,
                  default: () => <Icon icon="ant-design:question-circle-outlined" size={16} color="var(--app-color-primary)" class="ml-2px relative top-1px"></Icon>
                }}
              </ATooltip>
            </>
          )
        }
      }

      return (
        <AFormItem {...getFormItemProps(item)}>
          {{
            ...formItemSlots,
            default: () => {
              const Com = componentMap[item.component as string] as ReturnType<typeof defineComponent>

              const { autoSetPlaceholder } = unref(getProps)

              return slots[item.field] ? (
                getSlot(slots, item.field, formModel.value)
              ) : (
                <Com
                  {...(autoSetPlaceholder && setTextPlaceholder(item))}
                  {...setComponentProps(item)}
                  style={item.componentProps?.style}
                  {...(notRenderOptions.includes(item?.component as string) && item?.componentProps?.options ? { options: item?.componentProps?.options || [] } : {})}
                  {...getModelBind(item)}
                >
                  {{ ...slotsMap }}
                </Com>
              )
            }
          }}
        </AFormItem>
      )
    }

    const renderOptions = (item: FormSchema) => {
      switch (item.component) {
        case 'Select':
          const { renderSelectOptions } = useRenderSelect(slots)
          return renderSelectOptions(item)
        case 'Radio':
        case 'RadioButton':
          const { renderRadioOptions } = useRenderRadio()
          return renderRadioOptions(item)
        case 'Checkbox':
        case 'CheckboxButton':
          const { renderCheckboxOptions } = useRenderCheckbox()
          return renderCheckboxOptions(item)
        default:
          break
      }
    }

    const getFormBindValue = () => {
      const delKeys = ['schema', 'isCol', 'autoSetPlaceholder', 'isCustom', 'model', 'labelWidth']
      const props = { ...unref(getProps) }
      for (const key in props) {
        if (delKeys.indexOf(key) !== -1) {
          delete props[key]
        }
      }

      const width = toSizeUnit(unref(getProps).labelWidth)
      return {
        ...props,
        ...(width ? { labelCol: { style: { width } } } : {})
      }
    }

    return () => (
      <AForm ref={elFormRef} {...getFormBindValue()} model={props.isCustom ? props.model : unref(formModel)} class={prefixCls}>
        {{
          default: () => {
            const { isCustom } = unref(getProps)
            return isCustom ? getSlot(slots, 'default') : renderWrap()
          }
        }}
      </AForm>
    )
  }
})
</script>

<style lang="less" scoped>
.@{namespace}-form {
  :deep(.ant-row) {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }

  :deep(.ant-form-item) {
    width: 100%;
  }

  :deep(.ant-picker),
  :deep(.ant-select),
  :deep(.ant-input-number),
  :deep(.ant-cascader-picker),
  :deep(.ant-input),
  :deep(.ant-input-affix-wrapper) {
    width: 100%;
  }

  :deep(.ant-divider) {
    margin-right: 0 !important;
    margin-left: 0 !important;
  }
}
</style>
