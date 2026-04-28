import { ConfigPanel } from '../components/ConfigPanel'
import { PreviewFrame } from '../components/PreviewFrame'
import { SnippetPanel } from '../components/SnippetPanel'
import { ConfigProvider } from '../context/ConfigContext'

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-6 h-6 rounded-full bg-[#333] overflow-hidden relative shrink-0">
        <div className="absolute top-0 left-3 w-3 h-3 bg-[#D9D9D9]" />
        <div className="absolute top-3 left-0 w-3 h-3 bg-[#D9D9D9]" />
      </div>
      <span className="text-[16px] font-semibold text-[#262626] leading-normal">Lucky Wheel</span>
    </div>
  )
}

function AppContent() {
  return (
    <div className="h-screen w-screen bg-white text-[#262626] flex">
      {/* Sidebar */}
      <div className="w-[375px] shrink-0 h-full flex flex-col bg-white relative">
        <div className="px-[19px] pt-[18px] pb-0 shrink-0">
          <Logo />
        </div>

        <div className="flex-1 overflow-auto mt-[18px]">
          <ConfigPanel />
        </div>

        <div className="shrink-0">
          <SnippetPanel />
        </div>
      </div>

      {/* Preview area */}
      <div className="flex-1 h-full overflow-hidden">
        <PreviewFrame />
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ConfigProvider>
      <AppContent />
    </ConfigProvider>
  )
}
