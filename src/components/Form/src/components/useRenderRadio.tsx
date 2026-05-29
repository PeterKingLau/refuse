import { Radio as ARadio, RadioButton as ARadioButton } from 'ant-design-vue'
import type { FormSchema } from '@/types/form'

export const useRenderRadio = () => {
  const renderRadioOptions = (item: FormSchema) => {
    const labelAlias = item?.componentProps?.optionsAlias?.labelField
    const valueAlias = item?.componentProps?.optionsAlias?.valueField
    const Com = item.component === 'Radio' ? ARadio : ARadioButton

    return item?.componentProps?.options?.map((option) => {
      const { value, ...other } = option
      const optionValue = option[valueAlias || 'value']

      return (
        <Com {...other} key={optionValue} value={optionValue}>
          {option[labelAlias || 'label']}
        </Com>
      )
    })
  }

  return {
    renderRadioOptions
  }
}
