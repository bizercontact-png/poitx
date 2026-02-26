'use client'

import { Plugin, PluginManifest, PluginAPI, PluginStore } from '../types/plugin'
import { supabase } from './supabase'

class PluginSystem {
  private store: PluginStore = {
    plugins: new Map(),
    enabledPlugins: new Set(),
    api: this.createAPI()
  }

  private createAPI(): PluginAPI {
    return {
      fetch: async (url: string, options?: any) => {
        return fetch(url, options)
      },
      database: {
        get: async (key: string) => {
          const { data } = await supabase
            .from('plugin_data')
            .select('value')
            .eq('key', key)
            .single()
          return data?.value
        },
        set: async (key: string, value: any) => {
          await supabase
            .from('plugin_data')
            .upsert({ key, value })
        },
        delete: async (key: string) => {
          await supabase
            .from('plugin_data')
            .delete()
            .eq('key', key)
        },
        list: async (prefix: string) => {
          const { data } = await supabase
            .from('plugin_data')
            .select('key')
            .like('key', `${prefix}%`)
          return data?.map(d => d.key) || []
        }
      },
      notify: (message: string, type: 'info' | 'success' | 'error' = 'info') => {
        // اینجا می‌تونی از یه سیستم نوتیفیکیشن استفاده کنی
        console.log(`[${type}] ${message}`)
      },
      ui: {
        showToast: (message: string, duration: number = 3000) => {
          // اینجا می‌تونی toast سفارشی نشون بدی
          console.log(`Toast: ${message}`)
        },
        showModal: (content: React.ReactNode) => {
          // اینجا می‌تونی modal نشون بدی
          return Promise.resolve()
        }
      }
    }
  }

  // ثبت پلاگین
  async registerPlugin(plugin: Plugin) {
    const { manifest } = plugin
    
    if (this.store.plugins.has(manifest.id)) {
      throw new Error(`Plugin ${manifest.id} already registered`)
    }

    this.store.plugins.set(manifest.id, plugin)
    console.log(`✅ Plugin registered: ${manifest.name} v${manifest.version}`)

    // اگه قبلاً فعال بوده، فعالش کن
    if (this.store.enabledPlugins.has(manifest.id)) {
      await this.enablePlugin(manifest.id)
    }
  }

  // فعال کردن پلاگین
  async enablePlugin(pluginId: string) {
    const plugin = this.store.plugins.get(pluginId)
    if (!plugin) throw new Error(`Plugin ${pluginId} not found`)

    try {
      await plugin.activate(this.store.api)
      this.store.enabledPlugins.add(pluginId)
      console.log(`✅ Plugin enabled: ${plugin.manifest.name}`)
    } catch (error) {
      console.error(`❌ Failed to enable plugin ${pluginId}:`, error)
    }
  }

  // غیرفعال کردن پلاگین
  async disablePlugin(pluginId: string) {
    const plugin = this.store.plugins.get(pluginId)
    if (!plugin) throw new Error(`Plugin ${pluginId} not found`)

    try {
      if (plugin.deactivate) {
        await plugin.deactivate()
      }
      this.store.enabledPlugins.delete(pluginId)
      console.log(`✅ Plugin disabled: ${plugin.manifest.name}`)
    } catch (error) {
      console.error(`❌ Failed to disable plugin ${pluginId}:`, error)
    }
  }

  // اجرای دستور پلاگین
  async executeCommand(pluginId: string, command: string, args: any) {
    const plugin = this.store.plugins.get(pluginId)
    if (!plugin) throw new Error(`Plugin ${pluginId} not found`)
    if (!this.store.enabledPlugins.has(pluginId)) throw new Error(`Plugin ${pluginId} is disabled`)
    if (!plugin.commands?.[command]) throw new Error(`Command ${command} not found`)

    return await plugin.commands[command](args)
  }

  // دریافت کامپوننت پلاگین
  getComponent(pluginId: string, componentName: string): React.ComponentType<any> | null {
    const plugin = this.store.plugins.get(pluginId)
    return plugin?.components?.[componentName] || null
  }

  // لیست پلاگین‌های فعال
  getEnabledPlugins(): Plugin[] {
    return Array.from(this.store.enabledPlugins)
      .map(id => this.store.plugins.get(id)!)
      .filter(Boolean)
  }

  // لیست همه پلاگین‌ها
  getAllPlugins(): Plugin[] {
    return Array.from(this.store.plugins.values())
  }

  // ذخیره وضعیت
  async saveState() {
    await supabase
      .from('plugin_state')
      .upsert({
        enabled_plugins: Array.from(this.store.enabledPlugins)
      })
  }

  // بارگذاری وضعیت
  async loadState() {
    const { data } = await supabase
      .from('plugin_state')
      .select('enabled_plugins')
      .single()

    if (data?.enabled_plugins) {
      this.store.enabledPlugins = new Set(data.enabled_plugins)
      // فعال کردن پلاگین‌ها
      for (const pluginId of this.store.enabledPlugins) {
        await this.enablePlugin(pluginId)
      }
    }
  }
}

export const pluginSystem = new PluginSystem()
