import { useEffect, useMemo, useRef, useState } from 'react'
import { useConfig } from '../context/ConfigContext'
import { WHEEL_PREVIEW_BOOTSTRAP_SRC_DOC, buildWheelPreviewMessage } from '../lib/generator'

type PreviewMode = 'desktop' | 'mobile'

function ModeToggleButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center px-3 py-2 rounded-[6px] text-[14px] leading-[18px] transition-colors ${
        active
          ? 'bg-white border border-[#E6E6E6] text-[#262626]'
          : 'text-[#8F8F8F] hover:text-[#262626]'
      }`}
    >
      {children}
    </button>
  )
}

export function PreviewFrame() {
  const { config } = useConfig()
  const [mode, setMode] = useState<PreviewMode>('desktop')
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const pendingLoadRef = useRef(true)
  const previewMessageRef = useRef(buildWheelPreviewMessage(config))

  const previewMessage = useMemo(() => buildWheelPreviewMessage(config), [config])
  previewMessageRef.current = previewMessage

  // В mobile preview убираем внешние обёртки bootstrap, оставляя корневым контейнером pop-up только cqp__body.
  const mobilePreviewSrcDoc = useMemo(
    () =>
      WHEEL_PREVIEW_BOOTSTRAP_SRC_DOC
        .replace('<div class="cqp__bg bg_open"></div>\n<div class="wrapper__body d_flex">\n', '')
        .replace('\n</div>\n</div>\n</div>\n<script>', '\n</div>\n</div>\n<script>'),
    [],
  )
  const mobilePreviewCenteredSrcDoc = useMemo(
    () =>
      mobilePreviewSrcDoc.replace(
        '</style>',
        '\nbody{display:flex;align-items:center;justify-content:center;}\n.cqp__body{margin:0 !important;}\n</style>',
      ),
    [mobilePreviewSrcDoc],
  )

  useEffect(() => {
    pendingLoadRef.current = true
  }, [mode])

  useEffect(() => {
    if (pendingLoadRef.current) return
    iframeRef.current?.contentWindow?.postMessage(previewMessage, '*')
  }, [previewMessage])

  const onIframeLoad = () => {
    pendingLoadRef.current = false
    iframeRef.current?.contentWindow?.postMessage(previewMessageRef.current, '*')
  }

  const isMobile = mode === 'mobile'

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3 shrink-0">
        <p className="text-[16px] font-semibold text-[#262626] leading-normal">
          Предпросмотр
        </p>
        <div className="bg-[#EDEDED] flex gap-0.5 p-0.5 rounded-lg">
          <ModeToggleButton active={!isMobile} onClick={() => setMode('desktop')}>
            Десктоп
          </ModeToggleButton>
          <ModeToggleButton active={isMobile} onClick={() => setMode('mobile')}>
            Телефон
          </ModeToggleButton>
        </div>
      </div>

      <div
        className={`flex-1 mx-5 mb-5 rounded-xl overflow-hidden relative ${isMobile ? 'bg-[#1F1F1F]' : 'bg-[#8F8F8F]'}`}
      >
        {isMobile ? (
          <div className="flex items-center justify-center h-full">
            <div
              className="relative overflow-hidden"
              style={{ width: 375, height: 752, boxShadow: '0 5px 15px 2px rgba(0, 0, 0, 0.15)' }}
            >
              <iframe
                ref={iframeRef}
                key="mobile"
                title="preview-mobile"
                srcDoc={mobilePreviewCenteredSrcDoc}
                onLoad={onIframeLoad}
                style={{ width: 375, height: '100%', border: 'none', display: 'block' }}
                sandbox="allow-scripts allow-forms allow-popups"
              />
            </div>
          </div>
        ) : (
          <iframe
            ref={iframeRef}
            key="desktop"
            title="preview-desktop"
            srcDoc={WHEEL_PREVIEW_BOOTSTRAP_SRC_DOC}
            onLoad={onIframeLoad}
            className="w-full h-full border-0"
            sandbox="allow-scripts allow-forms allow-popups"
          />
        )}
      </div>
    </div>
  )
}
