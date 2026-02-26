// app/plugins/my-plugin/index.ts
import { Plugin } from '../../types/plugin'

export const myPlugin: Plugin = {
  manifest: {
    id: 'poitx.my-plugin',
    name: 'My Plugin',
    version: '1.0.0',
    description: 'توضیحات پلاگین',
    author: 'Your Name',
    icon: '✨',
    category: 'utility',
    permissions: [],
    apiVersion: '1.0.0'
  },

  async activate(api) {
    // کد فعال‌سازی
  },

  commands: {
    myCommand: async (args) => {
      // منطق فرمان
      return { result: 'done' }
    }
  }
}
