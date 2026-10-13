import * as esbuild from 'esbuild'

await esbuild.build({
  entryPoints: ['webview-ui/main.ts'],
  bundle: true,
  outfile: 'resources/webview.js',
  platform: 'browser',
  target: 'es2022',
  format: 'iife',
  sourcemap: false,
  minify: false,
})

console.log('webview bundle done -> resources/webview.js')
