/**
 * Единый источник палитры для колеса и попапа.
 * Тема (light/dark) задаётся config.theme.mode; из неё выводятся все цвета
 * для превью и сниппета, чтобы не было рассинхрона.
 */
export type WheelTheme = 'light' | 'dark'

export type WheelPalette = {
  bg: string
  text: string
  primary: string
  neutral: string
  segmentLight: string
  segmentDark: string
  textOnPrimary: string
  textOnNeutral: string
  subText: string
}

export function getPalette(theme: WheelTheme): WheelPalette {
  return theme === 'dark'
    ? {
        bg: '#0B1220',
        text: '#E5E7EB',
        primary: '#7338F8',
        neutral: '#111827',
        segmentLight: '#1F2937',
        segmentDark: '#7338F8',
        textOnPrimary: '#FFFFFF',
        textOnNeutral: '#E5E7EB',
        subText: '#9CA3AF',
      }
    : {
        bg: '#FFFFFF',
        text: '#111827',
        primary: '#7338F8',
        neutral: '#F2F4F8',
        segmentLight: '#F2F4F8',
        segmentDark: '#7338F8',
        textOnPrimary: '#FFFFFF',
        textOnNeutral: '#202F3A',
        subText: '#808080',
      }
}

/** Цвет заливки сегмента по индексу (чередование light/dark). Не перетирает кастомный fill. */
export function getSegmentFill(palette: WheelPalette, index: number, customFill?: string): string {
  return customFill ?? (index % 2 === 0 ? palette.segmentLight : palette.segmentDark)
}

/** Цвет текста на сегменте по индексу. Не перетирает кастомный textColor. */
export function getSegmentTextColor(palette: WheelPalette, index: number, customTextColor?: string): string {
  return customTextColor ?? (index % 2 === 0 ? palette.textOnNeutral : palette.textOnPrimary)
}

/**
 * Возвращает контрастный цвет текста (#FFFFFF или #111827) для заданного фона.
 * Использует относительную яркость (WCAG sRGB luma).
 */
export function contrastColor(hex: string): '#FFFFFF' | '#111827' {
  // Нормализуем #RGB → #RRGGBB
  const normalized = hex.length === 4
    ? `#${hex[1]}${hex[1]}${hex[2]}${hex[2]}${hex[3]}${hex[3]}`
    : hex
  const r = parseInt(normalized.slice(1, 3), 16)
  const g = parseInt(normalized.slice(3, 5), 16)
  const b = parseInt(normalized.slice(5, 7), 16)
  if (isNaN(r) || isNaN(g) || isNaN(b)) return '#111827'
  const toLinear = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4)
  }
  const luma = 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  return luma > 0.179 ? '#111827' : '#FFFFFF'
}
