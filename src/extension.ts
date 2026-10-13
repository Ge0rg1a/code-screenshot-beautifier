import * as vscode from 'vscode'
import { captureSelection } from './commands/captureSelection'

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand('codeShot.captureSelection', () =>
      captureSelection(context)
    )
  )
}

export function deactivate() {}
