import Table from './src/Table.vue'
import { TableSetPropsType } from '@/types/table'

export interface TableActionExpose {
  toggleAllSelection: () => void
  clearSelection: () => void
}

export interface TableExpose {
  setProps: (props: Recordable) => void
  setColumn: (columnProps: TableSetPropsType[]) => void
  selections: Recordable[]
  elTableRef: TableActionExpose
  toggleAllSelection: () => void
  clearSelection: () => void
}

export { Table }
