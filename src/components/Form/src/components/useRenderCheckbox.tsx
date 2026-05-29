import { Checkbox as ACheckbox } from 'ant-design-vue'
import type { FormSchema } from '@/types/form'

export const useRenderCheckbox = () => {
  const renderCheckboxOptions = (item: FormSchema) => {
    const labelAlias = item?.componentProps?.optionsAlias?.labelField
    const valueAlias = item?.componentProps?.optionsAlias?.valueField

    return item?.componentProps?.options?.map((option) => {
      const { value, ...other } = option
      const optionValue = option[valueAlias || 'value']

      return (
        <ACheckbox {...other} key={optionValue} value={optionValue}>
          {option[labelAlias || 'label']}
        </ACheckbox>
      )
    })
  }

  return {
    renderCheckboxOptions
  }
}
