import * as vscode from 'vscode'
import * as path from 'path'
import * as os from 'os'
import * as fs from 'fs'
import { execSync } from 'child_process'
import { THEMES, BACKGROUNDS, FONTS } from '../config/themes'

export interface ShotData {
  code: string
  languageId: string
}

export class CodeShotPanel {
  private static panel: vscode.WebviewPanel | undefined

  public static createOrShow(context: vscode.ExtensionContext, data: ShotData) {
    if (CodeShotPanel.panel) {
      CodeShotPanel.panel.reveal(vscode.ViewColumn.Beside)
      CodeShotPanel.panel.webview.postMessage({ type: 'update', data })
      return
    }

    const panel = vscode.window.createWebviewPanel(
      'codeShot',
      'Code Shot 截图',
      vscode.ViewColumn.Beside,
      {
        enableScripts: true,
        retainContextWhenHidden: true,
      }
    )

    CodeShotPanel.panel = panel
    panel.webview.html = CodeShotPanel.getHtml(panel.webview, context)

    panel.webview.onDidReceiveMessage(async (msg) => {
      if (msg.type === 'export') {
        const uri = await vscode.window.showSaveDialog({
          defaultUri: vscode.Uri.file('screenshot.png'),
          filters: { 'PNG Image': ['png'] },
        })
        if (uri) {
          const base64 = msg.data.replace(/^data:image\/png;base64,/, '')
          const buffer = Buffer.from(base64, 'base64')
          await vscode.workspace.fs.writeFile(uri, new Uint8Array(buffer))
          vscode.window.showInformationMessage(`截图已保存: ${uri.fsPath}`)
        }
      } else if (msg.type === 'copyClipboard') {
        try {
          const base64 = msg.data.replace(/^data:image\/png;base64,/, '')
          const buffer = Buffer.from(base64, 'base64')
          const tmpPath = path.join(os.tmpdir(), `codeshot-${Date.now()}.png`)
          fs.writeFileSync(tmpPath, buffer)
          const safePath = tmpPath.replace(/\\/g, '\\\\')
          const psScript = `Add-Type -AssemblyName System.Windows.Forms; Add-Type -AssemblyName System.Drawing; $img = [System.Drawing.Image]::FromFile('${safePath}'); [System.Windows.Forms.Clipboard]::SetImage($img); $img.Dispose()`
          execSync(`powershell -NoProfile -NonInteractive -Command "${psScript}"`)
          fs.unlinkSync(tmpPath)
          vscode.window.showInformationMessage('已复制到剪贴板')
        } catch (e) {
          vscode.window.showErrorMessage('复制失败: ' + (e as Error).message)
        }
      }
    })

    panel.webview.postMessage({ type: 'init', data })

    panel.onDidDispose(() => {
      CodeShotPanel.panel = undefined
    })
  }

  private static getHtml(webview: vscode.Webview, context: vscode.ExtensionContext): string {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(context.extensionUri, 'resources', 'webview.js')
    )

    const config = vscode.workspace.getConfiguration('codeShot')
    const settings = {
      theme: config.get('theme', 'github-dark'),
      fontFamily: config.get('fontFamily', 'Fira Code'),
      fontSize: config.get('fontSize', 14),
      background: config.get('background', 'gradient-1'),
      windowStyle: config.get('windowStyle', 'macos'),
      showLineNumbers: config.get('showLineNumbers', true),
      padding: config.get('padding', 32),
      watermark: config.get('watermark', ''),
    }

    const nonce = getNonce()

    return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src ${webview.cspSource} data:; script-src 'nonce-${nonce}' 'wasm-unsafe-eval'; style-src 'unsafe-inline';">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #1e1e2e; color: #cdd6f4; font-family: var(--vscode-font-family, sans-serif); display: flex; height: 100vh; overflow: hidden; }
  #preview { flex: 1; display: flex; justify-content: center; align-items: center; overflow: auto; padding: 24px; }
  #controls { width: 260px; flex-shrink: 0; background: #181825; border-left: 1px solid #313244; padding: 20px; overflow-y: auto; }
  #controls h3 { margin-bottom: 16px; font-size: 15px; color: #89b4fa; }
  .ctrl-group { margin-bottom: 16px; }
  .ctrl-group label { display: block; font-size: 12px; margin-bottom: 6px; color: #a6adc8; }
  .ctrl-group select, .ctrl-group input[type="number"], .ctrl-group input[type="text"] {
    width: 100%; padding: 6px 8px; background: #313244; border: 1px solid #45475a;
    color: #cdd6f4; border-radius: 4px; font-size: 12px; outline: none;
  }
  .ctrl-group select:focus, .ctrl-group input:focus { border-color: #89b4fa; }
  .ctrl-group label.checkbox-label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
  .ctrl-group input[type="checkbox"] { accent-color: #89b4fa; }
  #export-btn, #copy-btn {
    flex: 1; padding: 10px; border: none; border-radius: 4px; cursor: pointer;
    font-weight: bold; font-size: 13px; transition: background 0.15s;
  }
  #export-btn { background: #89b4fa; color: #1e1e2e; }
  #export-btn:hover { background: #74c7ec; }
  #copy-btn { background: #a6e3a1; color: #1e1e2e; }
  #copy-btn:hover { background: #94d488; }
  #export-btn:disabled, #copy-btn:disabled { background: #45475a; color: #a6adc8; cursor: not-allowed; }
  .btn-row { display: flex; gap: 8px; margin-top: 8px; }
  .shot-container { border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.4); display: inline-block; position: relative; }
  .shot-window { border-radius: 8px; overflow: hidden; }
  .window-buttons { padding: 10px 14px; display: flex; gap: 8px; background: rgba(0,0,0,0.12); }
  .window-buttons span { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
  .window-buttons span:nth-child(1) { background: #ff5f56; }
  .window-buttons span:nth-child(2) { background: #ffbd2e; }
  .window-buttons span:nth-child(3) { background: #27c93f; }
  .window-header-dark { height: 28px; background: rgba(0,0,0,0.2); }
  .shot-code { padding: 16px; overflow: hidden; }
  .shot-code pre, .shot-code code { margin: 0 !important; padding: 0 !important; background: transparent !important; }
  .watermark { position: absolute; bottom: 10px; right: 18px; font-size: 12px; color: rgba(255,255,255,0.6); pointer-events: none; }
  #loading { color: #a6adc8; font-size: 14px; }
</style>
</head>
<body>
<div id="preview"><div id="loading">正在加载语法高亮引擎...</div></div>
<div id="controls">
  <h3>Code Shot 截图</h3>
  <div class="ctrl-group">
    <label>主题</label>
    <select id="theme-select"></select>
  </div>
  <div class="ctrl-group">
    <label>背景</label>
    <select id="background-select"></select>
  </div>
  <div class="ctrl-group">
    <label>字体</label>
    <select id="font-select"></select>
  </div>
  <div class="ctrl-group">
    <label>窗口样式</label>
    <select id="window-select">
      <option value="macos">macOS 按钮</option>
      <option value="none">无</option>
      <option value="dark">深色标题栏</option>
    </select>
  </div>
  <div class="ctrl-group">
    <label>字号 (px)</label>
    <input type="number" id="font-size-input" min="8" max="32" value="14">
  </div>
  <div class="ctrl-group">
    <label>内边距 (px)</label>
    <input type="number" id="padding-input" min="0" max="64" value="32">
  </div>
  <div class="ctrl-group">
    <label>水印文字</label>
    <input type="text" id="watermark-input" placeholder="留空不显示">
  </div>
  <div class="ctrl-group">
    <label class="checkbox-label"><input type="checkbox" id="line-numbers-input" checked> 显示行号</label>
  </div>
  <div class="btn-row">
    <button id="export-btn">导出 PNG</button>
    <button id="copy-btn">复制到剪贴板</button>
  </div>
</div>
<script nonce="${nonce}">
  const VS_CODE_SETTINGS = ${JSON.stringify(settings)};
  const THEMES = ${JSON.stringify(THEMES)};
  const BACKGROUNDS = ${JSON.stringify(BACKGROUNDS)};
  const FONTS = ${JSON.stringify(FONTS)};
</script>
<script nonce="${nonce}" src="${scriptUri}"></script>
</body>
</html>`
  }
}

function getNonce(): string {
  let text = ''
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  for (let i = 0; i < 32; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length))
  }
  return text
}
