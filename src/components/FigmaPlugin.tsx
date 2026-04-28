import { useState } from 'react'
import { useConfig } from '../context/ConfigContext'

type ColorToken = {
  name: string
  value: string
}

type AppliedRole = 'accent' | 'base' | 'button'

function hexFromRgb(r: number, g: number, b: number): string {
  return `#${Math.round(r * 255).toString(16).padStart(2, '0')}${Math.round(g * 255).toString(16).padStart(2, '0')}${Math.round(b * 255).toString(16).padStart(2, '0')}`.toUpperCase()
}

function normalizeHexToken(value: string): string | null {
  const t = value.trim()
  if (/^#[0-9A-Fa-f]{6}$/.test(t)) return t.toUpperCase()
  if (/^#[0-9A-Fa-f]{3}$/.test(t))
    return `#${t[1]}${t[1]}${t[2]}${t[2]}${t[3]}${t[3]}`.toUpperCase()
  // Strip alpha channel (#RRGGBBAA → #RRGGBB)
  if (/^#[0-9A-Fa-f]{8}$/.test(t)) return t.slice(0, 7).toUpperCase()
  return null
}

/**
 * Parses several popular Figma token export formats:
 * - W3C Design Tokens: { $value: "#hex", $type: "color" }
 * - Style Dictionary: { value: "#hex", type: "color" }
 * - Figma Variables REST API: { type: "COLOR", value: { r, g, b, a } }
 * - Flat map: { "name": "#hex" }
 */
function parseFigmaTokens(obj: unknown, path: string[] = []): ColorToken[] {
  if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return []

  const record = obj as Record<string, unknown>

  // W3C Design Token: { $type: "color", $value: "#..." }
  if (record.$type === 'color' && typeof record.$value === 'string') {
    const hex = normalizeHexToken(record.$value)
    if (hex) return [{ name: path.join('.'), value: hex }]
    return []
  }

  // Style Dictionary: { type: "color", value: "#..." }
  if (record.type === 'color' && typeof record.value === 'string') {
    const hex = normalizeHexToken(record.value)
    if (hex) return [{ name: path.join('.'), value: hex }]
    return []
  }

  // Figma Variables REST API: { type: "COLOR", value: { r, g, b, a } }
  if (
    record.type === 'COLOR' &&
    record.value &&
    typeof record.value === 'object' &&
    'r' in record.value &&
    'g' in record.value &&
    'b' in record.value
  ) {
    const { r, g, b } = record.value as { r: number; g: number; b: number }
    return [{ name: path.join('.'), value: hexFromRgb(r, g, b) }]
  }

  // Recurse into nested objects
  const results: ColorToken[] = []
  for (const [key, val] of Object.entries(record)) {
    if (key.startsWith('$')) continue // skip metadata keys like $metadata, $themes
    if (typeof val === 'string') {
      const hex = normalizeHexToken(val)
      if (hex) results.push({ name: [...path, key].join('.'), value: hex })
    } else if (val && typeof val === 'object') {
      results.push(...parseFigmaTokens(val, [...path, key]))
    }
  }
  return results
}

const ROLE_LABELS: Record<AppliedRole, string> = {
  accent: 'Акцент',
  base: 'Базовый',
  button: 'Кнопка',
}

export function FigmaPlugin() {
  const { setConfig } = useConfig()
  const [open, setOpen] = useState(false)
  const [raw, setRaw] = useState('')
  const [tokens, setTokens] = useState<ColorToken[]>([])
  const [error, setError] = useState('')
  const [applied, setApplied] = useState<Record<string, AppliedRole>>({})

  const toggle = () => {
    setOpen((v) => !v)
    setTokens([])
    setRaw('')
    setError('')
    setApplied({})
  }

  const parse = () => {
    setError('')
    setTokens([])
    setApplied({})
    try {
      const json = JSON.parse(raw)
      const found = parseFigmaTokens(json)
      if (!found.length) {
        setError('Цвета не найдены. Убедитесь, что это JSON с цветовыми токенами Figma.')
      } else {
        setTokens(found)
      }
    } catch {
      setError('Невалидный JSON. Проверьте формат и попробуйте снова.')
    }
  }

  const applyToken = (token: ColorToken, role: AppliedRole) => {
    setApplied((prev) => ({ ...prev, [token.name]: role }))
    if (role === 'accent') setConfig((c) => ({ ...c, accentSegmentColor: token.value }))
    if (role === 'base') setConfig((c) => ({ ...c, baseSegmentColor: token.value }))
    if (role === 'button') setConfig((c) => ({ ...c, buttonColor: token.value }))
  }

  return (
    <div className="rounded-lg border bg-white p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold flex items-center gap-2">
          <FigmaIcon />
          Figma Tokens
        </div>
        <button
          type="button"
          onClick={toggle}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
        >
          {open ? 'Свернуть' : 'Импортировать'}
        </button>
      </div>

      {open && (
        <div className="space-y-3">
          <p className="text-xs text-gray-500 leading-relaxed">
            Вставьте JSON из плагина Figma (Design Tokens, Variables Export, Tokens Studio и др.)
            и нажмите «Распознать», затем примените нужные цвета.
          </p>

          <textarea
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs font-mono h-28 resize-none focus:outline-none focus:ring-1 focus:ring-indigo-400"
            placeholder={'{\n  "brand": {\n    "primary": { "$value": "#7338F8", "$type": "color" }\n  }\n}'}
            value={raw}
            onChange={(e) => setRaw(e.target.value)}
            spellCheck={false}
          />

          {error && (
            <p className="text-xs text-red-500 bg-red-50 rounded px-2 py-1">{error}</p>
          )}

          <button
            type="button"
            onClick={parse}
            disabled={!raw.trim()}
            className="w-full rounded-md bg-gray-900 text-white text-sm py-2 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Распознать цвета
          </button>

          {tokens.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-gray-400">
                Найдено {tokens.length} цвет{tokens.length === 1 ? '' : tokens.length < 5 ? 'а' : 'ов'}.
                Нажмите на роль, чтобы применить:
              </p>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-0.5">
                {tokens.map((t) => (
                  <div
                    key={t.name}
                    className="flex items-center gap-2 rounded-md border border-gray-100 bg-gray-50 p-2"
                  >
                    <div
                      className="w-7 h-7 rounded-md border border-black/10 shrink-0"
                      style={{ background: t.value }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate text-gray-800">{t.name}</div>
                      <div className="text-xs text-gray-400 font-mono">{t.value}</div>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {(['accent', 'base', 'button'] as const).map((role) => {
                        const active = applied[t.name] === role
                        return (
                          <button
                            key={role}
                            type="button"
                            onClick={() => applyToken(t, role)}
                            title={ROLE_LABELS[role]}
                            className={`text-xs px-2 py-0.5 rounded border transition-colors ${
                              active
                                ? 'bg-indigo-600 text-white border-indigo-600'
                                : 'bg-white text-gray-600 border-gray-300 hover:border-indigo-400 hover:text-indigo-600'
                            }`}
                          >
                            {ROLE_LABELS[role]}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function FigmaIcon() {
  return (
    <svg width="14" height="20" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M19 28.5C19 23.2533 23.2533 19 28.5 19C33.7467 19 38 23.2533 38 28.5C38 33.7467 33.7467 38 28.5 38C23.2533 38 19 33.7467 19 28.5Z" fill="#1ABCFE"/>
      <path d="M0 47.5C0 42.2533 4.25329 38 9.5 38H19V47.5C19 52.7467 14.7467 57 9.5 57C4.25329 57 0 52.7467 0 47.5Z" fill="#0ACF83"/>
      <path d="M19 0V19H28.5C33.7467 19 38 14.7467 38 9.5C38 4.25329 33.7467 0 28.5 0H19Z" fill="#FF7262"/>
      <path d="M0 9.5C0 14.7467 4.25329 19 9.5 19H19V0H9.5C4.25329 0 0 4.25329 0 9.5Z" fill="#F24E1E"/>
      <path d="M0 28.5C0 33.7467 4.25329 38 9.5 38H19V19H9.5C4.25329 19 0 23.2533 0 28.5Z" fill="#FF7262"/>
    </svg>
  )
}
