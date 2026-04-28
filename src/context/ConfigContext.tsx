import { createContext, useContext, useState, type ReactNode } from 'react'
import { DEFAULT_CONFIG, type WidgetConfig } from '../lib/config'

type ConfigContextValue = {
  config: WidgetConfig
  setConfig: (next: WidgetConfig | ((prev: WidgetConfig) => WidgetConfig)) => void
}

const ConfigContext = createContext<ConfigContextValue | null>(null)

export function ConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<WidgetConfig>(DEFAULT_CONFIG)
  return (
    <ConfigContext.Provider value={{ config, setConfig }}>
      {children}
    </ConfigContext.Provider>
  )
}

export function useConfig() {
  const ctx = useContext(ConfigContext)
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider')
  return ctx
}
