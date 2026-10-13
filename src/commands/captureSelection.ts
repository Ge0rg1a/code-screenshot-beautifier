import * as vscode from 'vscode'
import { CodeShotPanel } from '../webview/CodeShotPanel'

export function captureSelection(context: vscode.ExtensionContext) {
  const editor = vscode.window.activeTextEditor
  if (!editor) {
    vscode.window.showWarningMessage('没有打开的编辑器')
    return
  }

  const selection = editor.selection
  if (selection.isEmpty) {
    vscode.window.showWarningMessage('请先选中代码片段')
    return
  }

  const text = editor.document.getText(selection)
  const languageId = editor.document.languageId

  CodeShotPanel.createOrShow(context, { code: text, languageId })
}
