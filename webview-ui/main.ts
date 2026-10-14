/// <reference lib="dom" />

import { createHighlighter, type Highlighter } from 'shiki/bundle/full'
import html2canvas from 'html2canvas'

interface ShotData {
  code: string
  languageId: string
}

interface Settings {
  theme: string
  fontFamily: string
  fontSize: number
  background: string
  windowStyle: string
  showLineNumbers: boolean
  padding: number
  watermark: string
}

declare const VS_CODE_SETTINGS: Settings
declare const THEMES: Array<{ id: string; name: string; shikiTheme: string }>
declare const BACKGROUNDS: Array<{ id: string; name: string; css: string }>
declare const FONTS: string[]

const vscodeApi = acquireVsCodeApi()

let highlighter: Highlighter | null = null
let currentData: ShotData | null = null
let settings: Settings = { ...VS_CODE_SETTINGS }

const LANG_MAP: Record<string, string> = {
  typescript: 'typescript',
  typescriptreact: 'tsx',
  javascript: 'javascript',
  javascriptreact: 'jsx',
  python: 'python',
  go: 'go',
  rust: 'rust',
  java: 'java',
  c: 'c',
  cpp: 'cpp',
  csharp: 'csharp',
  css: 'css',
  scss: 'scss',
  less: 'less',
  html: 'html',
  json: 'json',
  yaml: 'yaml',
  markdown: 'markdown',
  shellscript: 'bash',
  bash: 'bash',
  sh: 'bash',
  sql: 'sql',
  php: 'php',
  ruby: 'ruby',
  kotlin: 'kotlin',
  swift: 'swift',
  dart: 'dart',
  vue: 'vue',
  svelte: 'svelte',
  dockerfile: 'dockerfile',
  graphql: 'graphql',
  plaintext: 'text',
}

function mapLanguage(id: string): string {
  return LANG_MAP[id] ?? 'text'
}

async function initHighlighter(): Promise<Highlighter> {
  const themeIds = THEMES.map((t) => t.shikiTheme)
  const langIds = Array.from(new Set(Object.values(LANG_MAP)))
  return createHighlighter({
    themes: themeIds,
    langs: langIds,
  })
}

function getBackground(id: string): string {
  return BACKGROUNDS.find((b) => b.id === id)?.css ?? '#1e1e2e'
}

function getShikiTheme(id: string): string {
  return THEMES.find((t) => t.id === id)?.shikiTheme ?? 'github-dark'
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function render(): void {
  if (!highlighter || !currentData) return

  const lang = mapLanguage(currentData.languageId)
  const shikiTheme = getShikiTheme(settings.theme)
  const loadedLangs = highlighter.getLoadedLanguages()
  const effectiveLang = loadedLangs.includes(lang) ? lang : 'text'

  const themeData = highlighter.getTheme(shikiTheme) as { bg?: string; fg?: string }
  const themeBg = themeData.bg || '#1e1e2e'

  const codeHtml = highlighter.codeToHtml(currentData.code, {
    lang: effectiveLang,
    theme: shikiTheme,
  })

  const bg = getBackground(settings.background)
  const ws = settings.windowStyle

  let windowHeader = ''
  if (ws === 'macos') {
    windowHeader = '<div class="window-buttons"><span></span><span></span><span></span></div>'
  } else if (ws === 'dark') {
    windowHeader = '<div class="window-header-dark"></div>'
  }

  const watermarkHtml = settings.watermark
    ? `<div class="watermark">${escapeHtml(settings.watermark)}</div>`
    : ''

  const container = document.getElementById('preview')!
  container.innerHTML = `
    <div class="shot-container" style="background:${bg};padding:${settings.padding}px;">
      <div class="shot-window" style="background-color:${themeBg};">
        ${windowHeader}
        <div class="shot-code" style="font-family:'${settings.fontFamily}',monospace;font-size:${settings.fontSize}px;line-height:1.6;">
          ${codeHtml}
        </div>
      </div>
      ${watermarkHtml}
    </div>
  `

  // 强制清除 shiki pre/code 的背景，让窗口背景色接管
  container.querySelectorAll('.shot-code pre, .shot-code code').forEach((el) => {
    const e = el as HTMLElement
    e.style.background = 'none'
    e.style.backgroundColor = 'transparent'
  })

  if (!settings.showLineNumbers) {
    container.querySelectorAll('.line').forEach((el) => {
      const lineEl = el as HTMLElement
      if (lineEl.dataset.line !== undefined) {
        lineEl.style.counterIncrement = 'none'
      }
    })
  }
}

function populateControls(): void {
  const themeSelect = document.getElementById('theme-select') as HTMLSelectElement
  THEMES.forEach((t) => {
    const opt = document.createElement('option')
    opt.value = t.id
    opt.textContent = t.name
    if (t.id === settings.theme) opt.selected = true
    themeSelect.appendChild(opt)
  })

  const bgSelect = document.getElementById('background-select') as HTMLSelectElement
  BACKGROUNDS.forEach((b) => {
    const opt = document.createElement('option')
    opt.value = b.id
    opt.textContent = b.name
    if (b.id === settings.background) opt.selected = true
    bgSelect.appendChild(opt)
  })

  const fontSelect = document.getElementById('font-select') as HTMLSelectElement
  FONTS.forEach((f) => {
    const opt = document.createElement('option')
    opt.value = f
    opt.textContent = f
    if (f === settings.fontFamily) opt.selected = true
    fontSelect.appendChild(opt)
  })

  const windowSelect = document.getElementById('window-select') as HTMLSelectElement
  windowSelect.value = settings.windowStyle

  const fontSizeInput = document.getElementById('font-size-input') as HTMLInputElement
  fontSizeInput.value = String(settings.fontSize)

  const paddingInput = document.getElementById('padding-input') as HTMLInputElement
  paddingInput.value = String(settings.padding)

  const watermarkInput = document.getElementById('watermark-input') as HTMLInputElement
  watermarkInput.value = settings.watermark

  const lineNumInput = document.getElementById('line-numbers-input') as HTMLInputElement
  lineNumInput.checked = settings.showLineNumbers
}

function bindEvents(): void {
  const themeSelect = document.getElementById('theme-select') as HTMLSelectElement
  themeSelect.addEventListener('change', () => {
    settings.theme = themeSelect.value
    render()
  })

  const bgSelect = document.getElementById('background-select') as HTMLSelectElement
  bgSelect.addEventListener('change', () => {
    settings.background = bgSelect.value
    render()
  })

  const fontSelect = document.getElementById('font-select') as HTMLSelectElement
  fontSelect.addEventListener('change', () => {
    settings.fontFamily = fontSelect.value
    render()
  })

  const windowSelect = document.getElementById('window-select') as HTMLSelectElement
  windowSelect.addEventListener('change', () => {
    settings.windowStyle = windowSelect.value
    render()
  })

  const fontSizeInput = document.getElementById('font-size-input') as HTMLInputElement
  fontSizeInput.addEventListener('input', () => {
    settings.fontSize = +fontSizeInput.value
    render()
  })

  const paddingInput = document.getElementById('padding-input') as HTMLInputElement
  paddingInput.addEventListener('input', () => {
    settings.padding = +paddingInput.value
    render()
  })

  const watermarkInput = document.getElementById('watermark-input') as HTMLInputElement
  watermarkInput.addEventListener('input', () => {
    settings.watermark = watermarkInput.value
    render()
  })

  const lineNumInput = document.getElementById('line-numbers-input') as HTMLInputElement
  lineNumInput.addEventListener('change', () => {
    settings.showLineNumbers = lineNumInput.checked
    render()
  })

  const exportBtn = document.getElementById('export-btn') as HTMLButtonElement
  exportBtn.addEventListener('click', exportPng)

  const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement
  copyBtn.addEventListener('click', copyToClipboard)
}

async function exportPng(): Promise<void> {
  const target = document.querySelector('.shot-container') as HTMLElement | null
  if (!target) {
    alert('预览内容未加载，请确认高亮引擎初始化成功后再试')
    return
  }

  const exportBtn = document.getElementById('export-btn') as HTMLButtonElement
  exportBtn.textContent = '导出中...'
  exportBtn.disabled = true

  try {
    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
      logging: false,
    })
    const dataUrl = canvas.toDataURL('image/png')
    vscodeApi.postMessage({ type: 'export', data: dataUrl })
  } catch (e) {
    console.error('导出失败', e)
    alert('导出失败: ' + (e as Error).message)
  } finally {
    exportBtn.textContent = '导出 PNG'
    exportBtn.disabled = false
  }
}

async function copyToClipboard(): Promise<void> {
  const target = document.querySelector('.shot-container') as HTMLElement | null
  if (!target) {
    alert('预览内容未加载，请确认高亮引擎初始化成功后再试')
    return
  }

  const copyBtn = document.getElementById('copy-btn') as HTMLButtonElement
  copyBtn.textContent = '复制中...'
  copyBtn.disabled = true

  try {
    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: null,
      useCORS: true,
      logging: false,
    })
    const dataUrl = canvas.toDataURL('image/png')
    vscodeApi.postMessage({ type: 'copyClipboard', data: dataUrl })
  } catch (e) {
    console.error('复制失败', e)
    alert('复制失败: ' + (e as Error).message)
  } finally {
    copyBtn.textContent = '复制到剪贴板'
    copyBtn.disabled = false
  }
}

window.addEventListener('message', (event) => {
  const msg = event.data
  if (msg.type === 'init' || msg.type === 'update') {
    currentData = msg.data as ShotData
    render()
  }
})

async function main(): Promise<void> {
  populateControls()
  bindEvents()
  try {
    highlighter = await initHighlighter()
    const loading = document.getElementById('loading')
    if (loading) loading.remove()
    render()
  } catch (e) {
    const loading = document.getElementById('loading')
    if (loading) loading.textContent = '加载失败: ' + (e as Error).message
    console.error(e)
  }
}

main()
