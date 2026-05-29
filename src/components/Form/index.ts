import Form from './src/Form.vue'
import type { FormInstance } from 'ant-design-vue/es/form'
import type { FormSchema, FormSetPropsType } from '@/types/form'

export type FormValidateCallback = (valid: boolean, fields?: any) => void

export type CompatibleFormInstance = Omit<FormInstance, 'validate'> & {
  validate: {
    (callback?: FormValidateCallback): Promise<any>
    (nameList?: Parameters<FormInstance['validate']>[0], options?: Parameters<FormInstance['validate']>[1]): Promise<any>
  }
}

export interface FormExpose {
  setValues: (data: Recordable) => void
  setProps: (props: Recordable) => void
  delSchema: (field: string) => void
  addSchema: (formSchema: FormSchema, index?: number) => void
  setSchema: (schemaProps: FormSetPropsType[]) => void
  formModel: Recordable
  getElFormRef: () => CompatibleFormInstance
}

export { Form }
