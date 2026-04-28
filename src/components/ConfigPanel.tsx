import { useState, useRef, useEffect, useMemo } from 'react'
import type { WidgetConfig, ContactField, SegmentCount } from '../lib/config'
import { resizeSegments, DEFAULT_CONFIG } from '../lib/config'
import { getProbabilitySumValidation } from '../lib/segmentProbability'
import { useConfig } from '../context/ConfigContext'

const SEGMENT_COUNTS: SegmentCount[] = [4, 6, 8, 10, 12]

type FieldCombo = {
  label: string
  fields: Record<ContactField, boolean>
}

const FIELD_COMBOS: FieldCombo[] = [
  { label: 'Телефон и Email', fields: { name: false, phone: true, email: true } },
  { label: 'Имя и Телефон', fields: { name: true, phone: true, email: false } },
  { label: 'Имя и Email', fields: { name: true, phone: false, email: true } },
  { label: 'Имя, Телефон и Email', fields: { name: true, phone: true, email: true } },
]

function ChevronIcon({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="6"
      viewBox="0 0 10 6"
      fill="none"
      className={`transition-transform ${open ? '' : 'rotate-180'}`}
    >
      <path d="M1 5L5 1L9 5" stroke="#8F8F8F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Divider() {
  return <div className="w-full h-px bg-[#E6E6E6]" />
}

function SectionHeader({
  title,
  open,
  onToggle,
}: {
  title: string
  open: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center justify-between w-full px-4 cursor-pointer"
    >
      <span className="text-[16px] font-semibold text-[#262626] leading-normal">{title}</span>
      <ChevronIcon open={open} />
    </button>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <p className="text-[14px] font-medium leading-4 text-[#262626]">{children}</p>
}

function TextInput({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-white border border-[#E6E6E6] rounded-lg px-3 py-[9px] text-[14px] text-[#262626] leading-[18px] placeholder:text-[#8F8F8F] outline-none focus:border-[#8F8F8F] transition-colors"
    />
  )
}

function TextAreaInput({
  value,
  onChange,
  placeholder,
  heightClass = 'h-[74px]',
}: {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  /** Tailwind height class, e.g. h-[64px] */
  heightClass?: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-white border border-[#E6E6E6] rounded-lg px-3 py-[10px] text-[14px] text-[#262626] leading-[18px] placeholder:text-[#8F8F8F] outline-none focus:border-[#8F8F8F] transition-colors resize-none ${heightClass}`}
    />
  )
}

function TabGroup<T extends string | number>({
  options,
  value,
  onChange,
  renderLabel,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  renderLabel?: (v: T) => string
}) {
  return (
    <div className="bg-[#EDEDED] flex gap-0.5 p-0.5 rounded-lg w-full">
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={String(opt)}
            type="button"
            onClick={() => onChange(opt)}
            className={`flex-1 flex items-center justify-center px-3 py-2 rounded-[6px] text-[14px] leading-[18px] transition-colors ${
              active
                ? 'bg-white border border-[#E6E6E6] text-[#262626]'
                : 'text-[#8F8F8F] hover:text-[#262626]'
            }`}
          >
            {renderLabel ? renderLabel(opt) : String(opt)}
          </button>
        )
      })}
    </div>
  )
}

/** Outer width of thumb (w-3); travel = track width − this so min/max align track ends with thumb edges. */
const SLIDER_THUMB_PX = 12

function Slider({
  value,
  min = 0,
  max = 100,
  onChange,
}: {
  value: number
  min?: number
  max?: number
  onChange: (v: number) => void
}) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100))

  const updateFromPointer = (clientX: number) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    onChange(Math.round(min + ratio * (max - min)))
  }

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      if (!dragging.current) return
      updateFromPointer(e.clientX)
    }
    const onUp = () => {
      dragging.current = false
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  })

  return (
    <div
      ref={trackRef}
      className="relative h-[14px] w-full cursor-pointer"
      onPointerDown={(e) => {
        dragging.current = true
        updateFromPointer(e.clientX)
      }}
    >
      <div className="absolute top-[5px] left-0 w-full h-[2px] bg-[#E6E6E6] rounded-full" />
      <div
        className="absolute top-[5px] left-0 h-[2px] bg-[#262626] rounded-full"
        style={{ width: `${pct}%` }}
      />
      <div
        className="absolute top-0 w-3 h-3 bg-white border-2 border-[#262626] rounded-full pointer-events-none"
        style={{
          left: `calc(${pct}% - ${(pct * SLIDER_THUMB_PX) / 100}px)`,
        }}
      />
    </div>
  )
}

function ColorPicker({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const [text, setText] = useState(value)
  const [error, setError] = useState(false)

  useEffect(() => {
    setText(value.toUpperCase())
    setError(false)
  }, [value])

  const normalizeHex = (s: string): string | null => {
    const t = s.trim()
    if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t.toUpperCase()
    if (/^#[0-9A-Fa-f]{3}$/.test(t))
      return `#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`.toUpperCase()
    return null
  }

  const handleText = (raw: string) => {
    setText(raw)
    const norm = normalizeHex(raw)
    if (norm) {
      setError(false)
      onChange(norm)
    } else {
      setError(true)
    }
  }

  const handlePicker = (hex: string) => {
    setText(hex.toUpperCase())
    setError(false)
    onChange(hex.toUpperCase())
  }

  return (
    <div className="flex items-stretch w-[120px]">
      <label className="relative z-0 bg-white border border-[#E6E6E6] rounded-l-lg flex items-center justify-center w-9 shrink-0 -mr-px cursor-pointer overflow-hidden focus-within:z-[1] focus-within:border-[#8F8F8F] transition-colors">
        <div className="w-3.5 h-3.5 rounded-full" style={{ background: normalizeHex(value) ?? '#000' }} />
        <input
          type="color"
          value={normalizeHex(value) ?? '#000000'}
          onChange={(e) => handlePicker(e.target.value)}
          className="absolute inset-0 opacity-0 cursor-pointer"
        />
      </label>
      <input
        type="text"
        value={text}
        onChange={(e) => handleText(e.target.value)}
        maxLength={7}
        className={`relative z-0 flex-1 min-w-0 bg-white border border-[#E6E6E6] rounded-r-lg px-3 py-[9px] text-[14px] text-[#262626] leading-[18px] outline-none -mr-px transition-colors focus:z-[1] ${
          error
            ? 'border-red-400 focus:border-red-400'
            : 'focus:border-[#8F8F8F]'
        }`}
      />
    </div>
  )
}

function fieldsMatch(a: Record<ContactField, boolean>, b: Record<ContactField, boolean>) {
  return a.name === b.name && a.phone === b.phone && a.email === b.email
}

function ContactFieldSelect({
  enabledFields,
  onChange,
}: {
  enabledFields: Record<ContactField, boolean>
  onChange: (fields: Record<ContactField, boolean>) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = FIELD_COMBOS.find((c) => fieldsMatch(c.fields, enabledFields))
  const label = current?.label ?? 'Выберите поля'

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full bg-white border border-[#E6E6E6] rounded-lg px-3 py-[9px] text-[14px] text-[#262626] leading-[18px] flex items-center justify-between outline-none focus:border-[#8F8F8F] transition-colors"
      >
        <span className={!current ? 'text-[#8F8F8F]' : ''}>{label}</span>
        <ChevronIcon open={open} />
      </button>
      {open && (
        <div className="absolute top-full left-0 w-full mt-1 bg-white rounded-lg shadow-[0px_0px_4px_0px_rgba(38,38,38,0.12),0px_2px_8px_0px_rgba(38,38,38,0.1)] z-10 p-0.5 flex flex-col gap-0.5">
          {FIELD_COMBOS.map((combo) => {
            const active = fieldsMatch(combo.fields, enabledFields)
            return (
              <button
                key={combo.label}
                type="button"
                onClick={() => {
                  onChange(combo.fields)
                  setOpen(false)
                }}
                className={`flex items-center justify-between w-full px-2.5 py-2 rounded-[6px] text-[14px] text-[#262626] leading-[18px] text-left transition-colors ${
                  active ? 'bg-[#EDEDED]' : 'hover:bg-[#F7F7F7]'
                }`}
              >
                <span>{combo.label}</span>
                {active && (
                  <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                    <path d="M1 4L4.5 7.5L11 1" stroke="#262626" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function ConfigPanel() {
  const { config, setConfig } = useConfig()

  const set = (patch: Partial<WidgetConfig>) => setConfig({ ...config, ...patch })
  const setTheme = (patch: Partial<WidgetConfig['theme']>) =>
    setConfig({ ...config, theme: { ...config.theme, ...patch } })

  const setFields = (fields: Record<ContactField, boolean>) => {
    setConfig({ ...config, enabledFields: fields })
  }

  const updateSeg = (id: string, patch: Partial<WidgetConfig['segments'][number]>) => {
    setConfig({
      ...config,
      segments: config.segments.map((s) => (s.id === id ? { ...s, ...patch } : s)),
    })
  }

  const [sectorsOpen, setSectorsOpen] = useState(true)
  const [formOpen, setFormOpen] = useState(true)
  const [designOpen, setDesignOpen] = useState(true)
  const [openSegments, setOpenSegments] = useState<Record<string, boolean>>({})
  /** String while editing weight (allows ""); missing key → show `String(seg.weight)` from config. */
  const [weightInputDraft, setWeightInputDraft] = useState<Record<string, string>>({})

  const { isProbabilitySumValid, probabilityValidationMessage } = useMemo(
    () => getProbabilitySumValidation(config.segments),
    [config.segments],
  )

  const toggleSegment = (id: string) =>
    setOpenSegments((prev) => ({ ...prev, [id]: !prev[id] }))

  const clearWeightDraft = (id: string) =>
    setWeightInputDraft((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })

  const handleSegmentCountChange = (nextCount: SegmentCount) => {
    const nextConfig = resizeSegments(config, nextCount)
    const currentIds = new Set(config.segments.map((seg) => seg.id))

    setOpenSegments((prev) => {
      const next = { ...prev }
      nextConfig.segments.forEach((seg) => {
        if (!currentIds.has(seg.id) && !Object.hasOwn(next, seg.id)) {
          next[seg.id] = false
        }
      })
      return next
    })

    setWeightInputDraft({})
    setConfig(nextConfig)
  }

  return (
    <div className="flex flex-col gap-3 px-5 pt-[3px]">
      {/* Block 1: Название проекта */}
      <div className="bg-[#F7F7F7] rounded-xl p-4">
        <div className="flex flex-col gap-1.5">
          <FieldLabel>Название проекта</FieldLabel>
          <TextInput
            value={config.cqpopupName}
            onChange={(v) => set({ cqpopupName: v })}
            placeholder="Введите название"
          />
        </div>
      </div>

      {/* Block 4: Секторы колеса */}
      <div
        className={`bg-[#F7F7F7] rounded-xl py-4 flex flex-col gap-4 ${
          !isProbabilitySumValid ? 'ring-1 ring-inset ring-[#F20D0D]' : ''
        }`}
      >
        <SectionHeader title="Секторы колеса" open={sectorsOpen} onToggle={() => setSectorsOpen(!sectorsOpen)} />

        {sectorsOpen && (
          <>
            <div className="px-4 flex flex-col gap-2">
              <TabGroup
                options={SEGMENT_COUNTS}
                value={config.segments.length as SegmentCount}
                onChange={handleSegmentCountChange}
              />
              {!isProbabilitySumValid && (
                <p className="text-[13px] leading-[18px] text-[#F20D0D]">{probabilityValidationMessage}</p>
              )}
            </div>

            {config.segments.map((seg, i) => {
              const segmentOpen = openSegments[seg.id] ?? true
              return (
              <div key={seg.id} className="flex flex-col gap-4">
                <Divider />

                <button
                  type="button"
                  onClick={() => toggleSegment(seg.id)}
                  className="flex items-center justify-between w-full px-4 cursor-pointer"
                >
                  <span
                    className={`text-[14px] leading-[18px] ${segmentOpen ? 'text-[#8F8F8F]' : 'text-[#262626]'}`}
                  >
                    Сектор {i + 1}
                  </span>
                  <ChevronIcon open={segmentOpen} />
                </button>

                {segmentOpen && (
                  <div className="flex flex-col gap-4 px-4">
                    <div className="flex flex-col gap-1.5">
                      <FieldLabel>Текст сектора</FieldLabel>
                      <TextInput
                        value={seg.label}
                        onChange={(v) => updateSeg(seg.id, { label: v })}
                        placeholder="Введите текст"
                      />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <FieldLabel>Название события</FieldLabel>
                      <TextInput
                        value={seg.eventName ?? ''}
                        onChange={(v) => updateSeg(seg.id, { eventName: v })}
                        placeholder="Введите название события"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex flex-col gap-1.5 flex-1 mr-3">
                        <FieldLabel>Вероятность выигрыша</FieldLabel>
                        <Slider
                          value={seg.weight}
                          min={0}
                          max={100}
                          onChange={(v) => {
                            clearWeightDraft(seg.id)
                            updateSeg(seg.id, { weight: v })
                          }}
                        />
                      </div>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={3}
                        value={
                          Object.hasOwn(weightInputDraft, seg.id)
                            ? weightInputDraft[seg.id]
                            : String(seg.weight)
                        }
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, '')
                          if (raw.length > 3) return
                          if (raw.length === 3 && raw !== '100') return

                          setWeightInputDraft((prev) => ({ ...prev, [seg.id]: raw }))

                          if (raw === '') return

                          const n = parseInt(raw, 10)
                          if (Number.isNaN(n)) return

                          if (raw.length <= 2) {
                            updateSeg(seg.id, { weight: n })
                          } else {
                            updateSeg(seg.id, { weight: 100 })
                          }
                        }}
                        onBlur={() => {
                          if (!Object.hasOwn(weightInputDraft, seg.id)) return
                          if (weightInputDraft[seg.id] !== '') return
                          updateSeg(seg.id, { weight: 0 })
                          clearWeightDraft(seg.id)
                        }}
                        className="w-[50px] bg-white border border-[#E6E6E6] rounded-lg px-3 py-[9px] text-[14px] text-[#262626] leading-[18px] outline-none text-center focus:border-[#8F8F8F] transition-colors"
                      />
                    </div>
                  </div>
                )}
              </div>
              )
            })}
          </>
        )}
      </div>

      {/* Block 2: Форма заявки */}
      <div className="bg-[#F7F7F7] rounded-xl py-4 flex flex-col gap-4">
        <SectionHeader title="Форма заявки" open={formOpen} onToggle={() => setFormOpen(!formOpen)} />

        {formOpen && (
          <>
            <div className="flex flex-col gap-4 px-4">
              <div className="flex flex-col gap-1.5">
                <FieldLabel>Заголовок</FieldLabel>
                <TextAreaInput
                  value={config.title}
                  onChange={(v) => set({ title: v })}
                  placeholder="Введите заголовок"
                  heightClass="h-[64px]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel>Подзаголовок</FieldLabel>
                <TextAreaInput
                  value={config.subtitle}
                  onChange={(v) => set({ subtitle: v })}
                  placeholder="Введите подзаголовок"
                  heightClass="h-[64px]"
                />
              </div>
            </div>

            <Divider />

            <div className="flex flex-col gap-4 px-4">
              <div className="flex flex-col gap-2">
                <FieldLabel>Контактные поля</FieldLabel>
                <ContactFieldSelect enabledFields={config.enabledFields} onChange={setFields} />
              </div>

              <div className="flex flex-col gap-1.5">
                <FieldLabel>Текст кнопки</FieldLabel>
                <TextInput
                  value={config.buttonText}
                  onChange={(v) => set({ buttonText: v })}
                  placeholder="Введите текст кнопки"
                />
              </div>
            </div>

            <Divider />

            <div className="flex flex-col gap-1.5 px-4">
              <FieldLabel>Текст на экране с выигрышем</FieldLabel>
              <TextAreaInput
                value={config.thankYou?.subtitle ?? DEFAULT_CONFIG.thankYou.subtitle}
                onChange={(v) =>
                  set({ thankYou: { ...(config.thankYou ?? DEFAULT_CONFIG.thankYou), subtitle: v } })
                }
                placeholder="Введите текст"
                heightClass="h-[76px]"
              />
            </div>
          </>
        )}
      </div>

      {/* Block 5: Дизайн виджета */}
      <div className="bg-[#F7F7F7] rounded-xl py-4 flex flex-col gap-4">
        <SectionHeader title="Дизайн виджета" open={designOpen} onToggle={() => setDesignOpen(!designOpen)} />

        {designOpen && (
          <>
            <div className="px-4">
              <TabGroup
                options={['light', 'dark'] as const}
                value={config.theme.mode}
                onChange={(v) => setTheme({ mode: v })}
                renderLabel={(v) => (v === 'light' ? 'Светлый' : 'Тёмный')}
              />
            </div>

            <Divider />

            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between px-4">
                <FieldLabel>Акцентный цвет</FieldLabel>
                <ColorPicker
                  value={config.accentSegmentColor ?? DEFAULT_CONFIG.accentSegmentColor}
                  onChange={(v) => set({ accentSegmentColor: v, buttonColor: v })}
                />
              </div>

              <div className="flex items-center justify-between px-4">
                <FieldLabel>Базовый сегмент</FieldLabel>
                <ColorPicker
                  value={config.baseSegmentColor ?? DEFAULT_CONFIG.baseSegmentColor}
                  onChange={(v) => set({ baseSegmentColor: v })}
                />
              </div>
            </div>

            <Divider />

            <div className="flex flex-col gap-2 px-4">
              <FieldLabel>Скругления кнопок и полей</FieldLabel>
              <Slider
                value={config.borderRadius}
                min={0}
                max={24}
                onChange={(v) => set({ borderRadius: v })}
              />
            </div>

            <div className="flex flex-col gap-2 px-4">
              <FieldLabel>Скругления краев поп-апа</FieldLabel>
              <Slider
                value={config.popupBorderRadius}
                min={0}
                max={32}
                onChange={(v) => set({ popupBorderRadius: v })}
              />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
