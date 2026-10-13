export interface ThemePreset {
  id: string
  name: string
  shikiTheme: string
}

export const THEMES: ThemePreset[] = [
  { id: 'github-dark', name: 'GitHub Dark', shikiTheme: 'github-dark' },
  { id: 'dracula', name: 'Dracula', shikiTheme: 'dracula' },
  { id: 'monokai', name: 'Monokai', shikiTheme: 'monokai' },
  { id: 'nord', name: 'Nord', shikiTheme: 'nord' },
  { id: 'one-dark-pro', name: 'One Dark Pro', shikiTheme: 'one-dark-pro' },
]

export interface BackgroundPreset {
  id: string
  name: string
  css: string
}

export const BACKGROUNDS: BackgroundPreset[] = [
  { id: 'gradient-1', name: '紫色梦幻', css: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' },
  { id: 'gradient-2', name: '海洋蓝', css: 'linear-gradient(135deg, #2E3192 0%, #1BFFFF 100%)' },
  { id: 'gradient-3', name: '日落橙', css: 'linear-gradient(135deg, #FF6B6B 0%, #FFE66D 100%)' },
  { id: 'gradient-4', name: '森林绿', css: 'linear-gradient(135deg, #134E5E 0%, #71B280 100%)' },
  { id: 'solid-dark', name: '纯色深', css: '#1e1e2e' },
  { id: 'solid-light', name: '纯色浅', css: '#f5f5f5' },
]

export const FONTS: string[] = [
  'Fira Code',
  'JetBrains Mono',
  'Source Code Pro',
  'Cascadia Code',
  'Consolas',
  'Menlo',
  'Monaco',
  'monospace',
]
