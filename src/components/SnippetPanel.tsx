import { useEffect, useMemo, useRef, useState } from 'react'
import { useConfig } from '../context/ConfigContext'
import { buildSnippet } from '../lib/generator'
import { isProbabilitySumValid } from '../lib/segmentProbability'

/** Success checkmark — Figma node 2062:17 (icon-only, on Primary #262626). */
function SnippetCopiedIcon() {
  return (
    <svg width="10" height="7" viewBox="0 0 10 7" fill="none" aria-hidden>
      <path
        d="M1 3.5L3.8 6L9 1"
        stroke="#E6E6E6"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SnippetPanel() {
  const { config } = useConfig()
  const [copied, setCopied] = useState(false)
  const copiedResetRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const snippet = useMemo(() => buildSnippet(config), [config])
  const canCopySnippet = isProbabilitySumValid(config.segments)

  useEffect(() => {
    if (!canCopySnippet) setCopied(false)
  }, [canCopySnippet])

  useEffect(
    () => () => {
      if (copiedResetRef.current) clearTimeout(copiedResetRef.current)
    },
    [],
  )

  const copy = async () => {
    if (!canCopySnippet) return
    try {
      await navigator.clipboard.writeText(snippet)
    } catch {
      return
    }
    if (copiedResetRef.current) clearTimeout(copiedResetRef.current)
    setCopied(true)
    copiedResetRef.current = setTimeout(() => {
      setCopied(false)
      copiedResetRef.current = null
    }, 2000)
  }

  const showSuccess = copied && canCopySnippet

  return (
    <div className="bg-white rounded-xl shadow-[0px_0px_4px_0px_rgba(38,38,38,0.08),0px_2px_8px_0px_rgba(38,38,38,0.1)] px-4 py-[15px] mx-[19px] mb-[19px]">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-[16px] font-semibold text-[#262626] leading-normal">JS-сниппет</p>
        </div>
        <button
          type="button"
          onClick={copy}
          disabled={!canCopySnippet}
          className={`shrink-0 rounded-lg h-9 w-[122px] transition-colors flex items-center justify-center overflow-hidden px-5 py-2.5 text-[14px] font-medium leading-4 ${
            !canCopySnippet
              ? 'bg-[#E6E6E6] text-[#8F8F8F] cursor-not-allowed'
              : showSuccess
                ? 'bg-[#262626] text-white hover:bg-[#262626]'
                : 'bg-[#262626] text-white hover:bg-[#404040]'
          }`}
        >
          {showSuccess ? <SnippetCopiedIcon /> : 'Копировать'}
        </button>
      </div>
    </div>
  )
}
