import { Chart } from '@antv/g2'
import type { MarkNode } from '@antv/g2'

export interface DashboardChartDatum {
  category: string
  series: string
  value: number
}

export type DashboardChartType = 'bar' | 'line'

export type DashboardChart = InstanceType<typeof Chart> & {
  interval: () => MarkNode
  line: () => MarkNode
}

const colors = ['#1677ff', '#52c41a', '#faad14', '#ff4d4f', '#722ed1', '#13c2c2']

export const timeOptions = [
  {
    id: 1,
    label: '今日'
  },
  {
    id: 2,
    label: '昨日'
  },
  {
    id: 3,
    label: '近7日'
  },
  {
    id: 4,
    label: '近30日'
  },
  {
    id: 5,
    label: '近180日'
  },
  {
    id: 6,
    label: '近365日'
  }
]

export const createDashboardChart = (container: HTMLElement) => {
  return new Chart({
    container,
    autoFit: true,
    height: 300,
    paddingTop: 34,
    paddingRight: 24,
    paddingBottom: 42,
    paddingLeft: 52
  }) as DashboardChart
}

export const toDashboardChartData = (categories: string[], series: Array<{ name: string; data: Array<number | string> }>): DashboardChartDatum[] => {
  return categories.flatMap((category, index) =>
    series.map((item) => ({
      category,
      series: item.name,
      value: Number(item.data[index] ?? 0)
    }))
  )
}

export const renderDashboardChart = (chart: DashboardChart, type: DashboardChartType, data: DashboardChartDatum[]) => {
  chart.clear()
  const chartData = data.length
    ? data
    : [
        {
          category: '暂无数据',
          series: '暂无数据',
          value: 0
        }
      ]

  const mark = type === 'bar' ? chart.interval() : chart.line()

  mark
    .data(chartData)
    .encode('x', 'category')
    .encode('y', 'value')
    .encode('color', 'series')
    .scale('color', {
      range: colors
    })
    .scale('x', {
      paddingInner: 0.45,
      paddingOuter: 0.35
    })
    .scale('y', {
      nice: true,
      zero: true
    })
    .axis('x', {
      title: false,
      labelAutoHide: true,
      labelAutoRotate: true
    })
    .axis('y', {
      title: false,
      grid: true
    })
    .legend('color', {
      position: 'top'
    })
    .tooltip({
      title: 'category',
      items: [
        (datum: DashboardChartDatum) => ({
          name: datum.series,
          value: datum.value
        })
      ]
    })

  if (type === 'bar') {
    mark
      .transform({
        type: 'dodgeX'
      })
      .style({
        maxWidth: 42,
        radiusTopLeft: 4,
        radiusTopRight: 4
      })
  } else {
    mark.encode('shape', 'smooth').style({
      lineWidth: 2
    })
  }

  void chart.render()
}
