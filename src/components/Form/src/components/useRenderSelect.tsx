import { SelectOption as ASelectOption, SelectOptGroup as ASelectOptGroup } from 'ant-design-vue'
import { getSlot } from '@/utils/tsxHelper'
import type { Slots } from 'vue'
import type { FormSchema } from '@/types/form'
import type { ComponentOptions } from '@/types/components'

export const useRenderSelect = (slots: Slots) => {
  const renderSelectOptions = (item: FormSchema) => {
    const labelAlias = item?.componentProps?.optionsAlias?.labelField
    return item?.componentProps?.options?.map((option) => {
      if (option?.options?.length) {
        return (
          <ASelectOptGroup key={option[labelAlias || 'label']} label={option[labelAlias || 'label']}>
            {() => {
              return option?.options?.map((v) => {
                return renderSelectOptionItem(item, v)
              })
            }}
          </ASelectOptGroup>
        )
      } else {
        return renderSelectOptionItem(item, option)
      }
    })
  }

  const renderSelectOptionItem = (item: FormSchema, option: ComponentOptions) => {
    const labelAlias = item?.componentProps?.optionsAlias?.labelField
    const valueAlias = item?.componentProps?.optionsAlias?.valueField

    const { label, value, ...other } = option
    const optionLabel = labelAlias ? option[labelAlias] : label
    const optionValue = valueAlias ? option[valueAlias] : value

    return (
      <ASelectOption {...other} key={optionValue} label={optionLabel} value={optionValue}>
        {{
          default: () => (item?.componentProps?.optionsSlot ? getSlot(slots, `${item.field}-option`, { item: option }) : optionLabel)
        }}
      </ASelectOption>
    )
  }

  return {
    renderSelectOptions
  }
}
