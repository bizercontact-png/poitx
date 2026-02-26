export type PluginManifest = {
  id: string
  name: string
  version: string
  description: string
  author: string
  icon?: string
  category: 'productivity' | 'development' | 'research' | 'entertainment' | 'utility'
  permissions: string[]
  apiVersion: '1.0.0'
}

export type PluginAPI = {
  // توابعی که پلاگین می‌تونه استفاده کنه
  fetch: (url: string, options?: any) => Promise<any>
  database: {
    get: (key: string) => Promise<any>
    set: (key: string, value: any) => Promise<void>
    delete: (key: string) => Promise<void>
    list: (prefix: string) => Promise<string[]>
  }
  notify: (message: string, type?: 'info' | 'success' | 'error') => void
  ui: {
    showToast: (message: string, duration?: number) => void
    showModal: (content: React.ReactNode) => Promise<any>
  }
}

export type Plugin = {
  manifest: PluginManifest
  activate: (api: PluginAPI) => Promise<void>
  deactivate?: () => Promise<void>
  commands?: Record<string, (args: any) => Promise<any>>
  components?: Record<string, React.ComponentType<any>>
}

export type PluginStore = {
  plugins: Map<string, Plugin>
  enabledPlugins: Set<string>
  api: PluginAPI
}
