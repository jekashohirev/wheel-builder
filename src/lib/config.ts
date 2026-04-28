import { getPalette, getSegmentFill, getSegmentTextColor } from './theme'

export type ContactField = 'name' | 'email' | 'phone'

export type Segment = {
  id: string
  label: string
  weight: number
  /** Заливка сегмента. Если не задано — берётся из палитры темы (чередование light/dark). */
  fill?: string
  /** Цвет текста на сегменте. Если не задано — из палитры темы. */
  textColor?: string
  /** Имя события CarrotQuest при выигрыше этого сектора. Если пусто — используется название по умолчанию. */
  eventName?: string
}

export type WidgetConfig = {
  cqpopupName: string

  title: string
  subtitle: string
  buttonText: string

  /** Настройки экрана «Спасибо» после выигрыша */
  thankYou: {
    title: string
    subtitle: string
  }

  enabledFields: Record<ContactField, boolean>

  theme: {
    mode: 'light' | 'dark'
    accent: string
    background: string
    text: string
  }

  /** Цвет кнопки «Крутить» и кнопки закрытия */
  buttonColor: string
  /** Цвет акцентного (нечётного) сегмента колеса */
  accentSegmentColor: string
  /** Цвет базового (чётного) сегмента колеса */
  baseSegmentColor: string

  /** Скругление кнопок и полей ввода (px) */
  borderRadius: number
  /** Скругление краёв поп-апа (px) */
  popupBorderRadius: number

  segments: Segment[]
}

function makeId(prefix = 'seg') {
  // crypto.randomUUID есть не везде, поэтому fallback
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? (crypto as any).randomUUID()
      : `${Date.now()}_${Math.random().toString(16).slice(2)}`
  return `${prefix}_${uuid}`
}

export const DEFAULT_CONFIG: WidgetConfig = {
  cqpopupName: 'Колесо фортуны (акция)',

  title: 'Испытайте удачу и выиграйте приз!',
  subtitle: 'Оставьте контакты и вращайте колесо. Все призы гарантированы.',
  buttonText: 'Крутить колесо',

  thankYou: {
    title: 'Поздравляем!',
    subtitle: 'Мы отправили информацию на почту. Если письмо не придет в течение 5 минут, проверьте папку «Спам».',
  },

  enabledFields: {
    name: false,
    email: true,
    phone: true,
  },

  theme: {
    mode: 'light',
    accent: '#7338F8',
    background: '#FFFFFF',
    text: '#111827',
  },

  buttonColor: '#7338F8',
  accentSegmentColor: '#7338F8',
  baseSegmentColor: '#F2F4F8',

  borderRadius: 0,
  popupBorderRadius: 0,

  // Без fill/textColor — цвета сегментов задаются через accentSegmentColor/baseSegmentColor.
  segments: [
    { id: makeId(), label: 'Скидка 5%', weight: 25, eventName: 'Колесо фортуны - Скидка 5%' },
    { id: makeId(), label: 'Бонус', weight: 25, eventName: 'Колесо фортуны - Бонус' },
    { id: makeId(), label: 'Скидка 10%', weight: 25, eventName: 'Колесо фортуны - Скидка 10%' },
    { id: makeId(), label: 'Подарок', weight: 25, eventName: 'Колесо фортуны - Подарок' },
  ],
}

export type SegmentCount = 4 | 6 | 8 | 10 | 12

/**
 * Равномерное распределение 100% по count секторам: base = floor(100/count),
 * остаток добавляется по одному проценту к первым секторам.
 */
export function distributeSegmentWeightsEvenly(count: number): number[] {
  const base = Math.floor(100 / count)
  const remainder = 100 - base * count
  const weights: number[] = []
  for (let i = 0; i < count; i++) {
    weights.push(base + (i < remainder ? 1 : 0))
  }
  return weights
}

/** Изменяет количество сегментов до targetCount, сохраняя кастомные данные существующих; веса всегда пересчитываются равномерно (сумма 100). */
export function resizeSegments(config: WidgetConfig, targetCount: SegmentCount): WidgetConfig {
  const current = config.segments
  if (current.length === targetCount) return config

  const weights = distributeSegmentWeightsEvenly(targetCount)

  if (current.length > targetCount) {
    const segments = current.slice(0, targetCount).map((seg, i) => ({
      ...seg,
      weight: weights[i],
    }))
    return { ...config, segments }
  }

  const palette = getPalette(config.theme.mode)
  const segments: Segment[] = []
  for (let i = 0; i < targetCount; i++) {
    if (i < current.length) {
      segments.push({ ...current[i], weight: weights[i] })
    } else {
      segments.push({
        id: makeId(),
        label: `Сегмент ${i + 1}`,
        weight: weights[i],
        fill: getSegmentFill(palette, i),
        textColor: getSegmentTextColor(palette, i),
        eventName: `${config.cqpopupName} - Сегмент ${i + 1}`,
      })
    }
  }
  return { ...config, segments }
}

export function addSegment(config: WidgetConfig): WidgetConfig {
  if (config.segments.length >= 8) return config

  const palette = getPalette(config.theme.mode)
  const index = config.segments.length
  const next: Segment = {
    id: makeId(),
    label: `Сегмент ${index + 1}`,
    weight: 10,
    fill: getSegmentFill(palette, index),
    textColor: getSegmentTextColor(palette, index),
    eventName: `${config.cqpopupName} - Сегмент ${index + 1}`,
  }

  return { ...config, segments: [...config.segments, next] }
}

export function removeSegment(config: WidgetConfig, idToRemove: string): WidgetConfig {
  if (config.segments.length <= 4) return config
  return { ...config, segments: config.segments.filter((s) => s.id !== idToRemove) }
}
