import introJs from 'intro.js'
import 'intro.js/introjs.css'
import { useI18n } from '@/hooks/web/useI18n'
import { useDesign } from '@/hooks/web/useDesign'

type IntroInstance = ReturnType<typeof introJs>
type IntroStep = Parameters<IntroInstance['addSteps']>[0][number]
type IntroOptions = Parameters<IntroInstance['setOptions']>[0]

export const useIntro = (steps?: IntroStep[], options?: IntroOptions) => {
  const { t } = useI18n()

  const { variables } = useDesign()

  const defaultSteps: IntroStep[] = steps || [
    {
      element: `#${variables.namespace}-menu`,
      title: t('common.menu'),
      intro: t('common.menuDes'),
      position: 'right'
    },
    {
      element: `#${variables.namespace}-tool-header`,
      title: t('common.tool'),
      intro: t('common.toolDes'),
      position: 'left'
    },
    {
      element: `#${variables.namespace}-tags-view`,
      title: t('common.tagsView'),
      intro: t('common.tagsViewDes'),
      position: 'bottom'
    }
  ]

  const defaultOptions: IntroOptions = options || {
    prevLabel: t('common.prevLabel'),
    nextLabel: t('common.nextLabel'),
    skipLabel: t('common.skipLabel'),
    doneLabel: t('common.doneLabel')
  }

  const introRef: IntroInstance = introJs()

  introRef.addSteps(defaultSteps).setOptions(defaultOptions)

  return {
    introRef
  }
}
