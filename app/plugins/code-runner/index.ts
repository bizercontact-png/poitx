import { Plugin } from '../../types/plugin'

export const codeRunnerPlugin: Plugin = {
  manifest: {
    id: 'poitx.code-runner',
    name: 'Code Runner',
    version: '1.0.0',
    description: 'اجرای کد در زبان‌های مختلف (Python, JavaScript, ...)',
    author: 'POITX Team',
    icon: '⚡',
    category: 'development',
    permissions: ['network'],
    apiVersion: '1.0.0'
  },

  async activate(api) {
    console.log('Code Runner plugin activated')
  },

  commands: {
    runCode: async ({ language, code }: { language: string; code: string }) => {
      // اینجا می‌تونی از APIهای اجرای کد مثل Piston یا Judge0 استفاده کنی
      try {
        const response = await fetch('https://emkc.org/api/v2/piston/execute', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            language,
            version: '*',
            files: [{ content: code }]
          })
        })

        const result = await response.json()
        return {
          output: result.run.output,
          error: result.compile?.output
        }
      } catch (error) {
        return { error: 'Could not execute code' }
      }
    },

    getSupportedLanguages: async () => {
      return {
        languages: [
          'python',
          'javascript',
          'typescript',
          'java',
          'cpp',
          'csharp',
          'go',
          'rust',
          'php'
        ]
      }
    }
  }
}
