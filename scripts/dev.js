import minimist from "minimist";
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from "module";
import esbuild from 'esbuild'

const args = minimist(process.argv.slice(2))
const __filePath = fileURLToPath(import.meta.url)
const __dirname = dirname(__filePath)

// 需要打包的模块
const target = args._[0] || 'reactivity'

// 入口文件
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`)

// 输出文件
const outfile = resolve(__dirname, `../packages/${target}/dist/${target}.js`)

// 打包后的模块化规范
const format = args.f || 'iife'

// 加载json
const pkg = createRequire(import.meta.url)(`../packages/${target}/package.json`)

esbuild.context({
  entryPoints: [entry],
  outfile,
  bundle: true,
  sourcemap: true,
  format,
  platform: 'browser',
  globalName: pkg.buildOptions?.name
}).then((ctx) => {
  console.log('build success')
  return ctx.watch()
})