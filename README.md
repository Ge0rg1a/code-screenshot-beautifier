# Code Screenshot Beautifier

VSCode 里的 Carbon。选中代码，右键生成截图，离线可用。

写博客、发推、做 PPT 的时候，想把代码贴好看点，一般得去 carbon.now.sh 复制粘贴。这个插件把这事搬进了 VSCode——选中代码，右键出图。

## 功能

- 选代码 → 右键 → 出图，不用开浏览器
- 高亮引擎和 VSCode 一样（Shiki + TextMate），颜色不会对不上
- 5 套主题：GitHub Dark / Dracula / Monokai / Nord / One Dark Pro
- 6 种背景：渐变 4 种 + 纯色 2 种
- 窗口样式：macOS 三色按钮 / 深色标题栏 / 无框
- 字体字号、内边距、水印、行号都能调
- 导出高清 PNG
- 无需联网

## 用法

1. 打开代码文件
2. 选一段代码
3. 右键 → **Code Shot: 生成截图**
4. 右边面板调参数
5. 点 **导出 PNG** 存文件

## 配置

| 配置项 | 默认值 | 说明 |
|--------|--------|------|
| `codeShot.theme` | `github-dark` | 主题 |
| `codeShot.fontFamily` | `Fira Code` | 字体 |
| `codeShot.fontSize` | `14` | 字号 (px) |
| `codeShot.background` | `gradient-1` | 背景 |
| `codeShot.windowStyle` | `macos` | 窗口样式 (`macos`/`none`/`dark`) |
| `codeShot.showLineNumbers` | `true` | 行号 |
| `codeShot.padding` | `32` | 内边距 (px) |
| `codeShot.watermark` | `""` | 水印，留空不显示 |

## 开发

```bash
npm install
npm run compile      # tsc + esbuild
npm run watch        # 监听
```

F5 调试。

## License

MIT
