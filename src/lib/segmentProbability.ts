import type { Segment } from './config'

export function sumSegmentWeights(segments: Segment[]): number {
  return segments.reduce((acc, seg) => {
    const w = seg.weight
    return acc + (typeof w === 'number' && Number.isFinite(w) ? w : 0)
  }, 0)
}

export function isProbabilitySumValid(segments: Segment[]): boolean {
  return sumSegmentWeights(segments) === 100
}

export type ProbabilityValidationTone = 'success' | 'warning' | 'error'

export type ProbabilitySumValidation = {
  totalProbability: number
  isProbabilitySumValid: boolean
  /** totalProbability − 100: отрицательно при недоборе, положительно при переборе */
  probabilityDelta: number
  probabilityValidationMessage: string
  probabilityValidationTone: ProbabilityValidationTone
}

export function getProbabilitySumValidation(segments: Segment[]): ProbabilitySumValidation {
  const totalProbability = sumSegmentWeights(segments)
  const probabilityDelta = totalProbability - 100
  const isProbabilitySumValid = probabilityDelta === 0

  let probabilityValidationMessage: string
  let probabilityValidationTone: ProbabilityValidationTone

  if (isProbabilitySumValid) {
    probabilityValidationMessage = ''
    probabilityValidationTone = 'success'
  } else if (totalProbability < 100) {
    const y = 100 - totalProbability
    probabilityValidationMessage = `Сумма вероятностей: ${totalProbability}%. Не хватает ${y}%`
    probabilityValidationTone = 'warning'
  } else {
    const y = totalProbability - 100
    probabilityValidationMessage = `Сумма вероятностей: ${totalProbability}%. Снизьте на ${y}%`
    probabilityValidationTone = 'error'
  }

  return {
    totalProbability,
    isProbabilitySumValid,
    probabilityDelta,
    probabilityValidationMessage,
    probabilityValidationTone,
  }
}
