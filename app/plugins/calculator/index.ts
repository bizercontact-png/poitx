import { Plugin } from '../../types/plugin'

export const calculatorPlugin: Plugin = {
  manifest: {
    id: 'poitx.calculator',
    name: 'Calculator Pro',
    version: '1.0.0',
    description: 'ماشین حساب پیشرفته با توابع علمی',
    author: 'POITX Team',
    icon: '🧮',
    category: 'utility',
    permissions: ['storage'],
    apiVersion: '1.0.0'
  },

  async activate(api) {
    console.log('Calculator plugin activated')
    
    // ذخیره تنظیمات پیش‌فرض
    await api.database.set('calculator.settings', {
      precision: 2,
      theme: 'dark'
    })
  },

  async deactivate() {
    console.log('Calculator plugin deactivated')
  },

  commands: {
    calculate: async ({ expression }: { expression: string }) => {
      try {
        // توجه: eval امن نیست، برای نمونه ساده استفاده شده
        const result = eval(expression)
        return { result, expression }
      } catch (error) {
        return { error: 'Invalid expression' }
      }
    },

    scientific: async ({ operation, value }: { operation: string; value: number }) => {
      const operations: Record<string, (x: number) => number> = {
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        log: Math.log10,
        ln: Math.log,
        sqrt: Math.sqrt,
        square: (x) => x * x,
        cube: (x) => x * x * x
      }

      if (!operations[operation]) {
        return { error: 'Unknown operation' }
      }

      return { result: operations[operation](value) }
    }
  },

  components: {
    CalculatorUI: () => {
      // اینجا می‌تونی کامپوننت React ماشین حساب رو برگردونی
      return null
    }
  }
}
