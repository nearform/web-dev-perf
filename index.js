'use strict'
require('make-promises-safe')

const fs = require('fs')
const path = require('path')
const util = require('util')
const childProcess = require('child_process')
const puppeteer = require('puppeteer')
const hdr = require('hdr-histogram-js')
const kill = util.promisify(require('tree-kill'))
const Table = require('cli-table3')
const fastFolderSize = util.promisify(require('fast-folder-size'))

const projects = require('./projects.json')
const tryConnect = require('./tryConnect')

const placeholder = '<div>placeholder</div>'
const iterations = 20
const url = 'http://localhost:3000'

const ms = 1e6
const s = 1e9
const bytesToMB = 1 / 1024 / 1024

function timer(resolution = ms) {
  const start = process.hrtime()

  return () => {
    const delta = process.hrtime(start)

    return (delta[0] * 1e9 + delta[1]) / resolution
  }
}

async function runReloadTime(page, filePath, originalContent) {
  const histogram = hdr.build()

  for (let i = 0; i < iterations; i++) {
    const id = `dummy-${i}`

    const newContent = originalContent.replace(
      placeholder,
      `${placeholder}
  <div id="${id}">hello ${id}</div>
        `
    )

    fs.writeFileSync(filePath, newContent)

    const end = timer()

    await page.waitForSelector(`#${id}`)

    histogram.recordValue(end())
  }

  return histogram
}

async function runProjects() {
  const browserTable = new Table({
    head: [
      'App',
      'Startup (s)',
      'Min (ms)',
      'Mean (ms)',
      '99th (ms)',
      'Max (ms)',
    ],
  })

  const bundleTable = new Table({
    head: ['App', 'Build time (s)', 'Bundle size (MB)'],
  })

  for (let project of projects) {
    const { dir } = project
    const basePath = path.join(__dirname, 'packages', dir)

    const browser = await puppeteer.launch({
      headless: true,
    })

    try {
      await runBrowserTests(basePath, project, browser, browserTable)
    } finally {
      await browser.close()
    }

    await runBundleTests(basePath, project, bundleTable)
  }

  console.log(browserTable.toString())
  console.log(bundleTable.toString())
}

async function runBundleTests(basePath, project, table) {
  const {
    scripts: { build },
    name,
    buildDir,
  } = project
  const buildScript = `npm run ${build}`

  console.log(`Executing ${buildScript} in ${basePath}`)

  const endBuildTime = timer(s)

  const app = childProcess.exec(buildScript, { cwd: basePath })

  if (process.env.DEBUG) {
    app.stdout.pipe(process.stdout)
    app.stderr.pipe(process.stderr)
  }

  await new Promise((resolve, reject) => {
    app.once('exit', resolve)
    app.once('error', reject)
  })

  const buildTimeSeconds = endBuildTime()

  const folderSize = await fastFolderSize(path.join(basePath, buildDir))

  table.push([name, buildTimeSeconds, folderSize * bytesToMB])
}

async function runBrowserTests(basePath, project, browser, table) {
  const { file, scripts, name } = project

  const filePath = path.join(basePath, file)
  const originalContent = fs.readFileSync(filePath, 'utf-8')
  const devScript = `npm run ${scripts.dev}`

  console.log(`Executing ${devScript} in ${basePath}`)

  const app = childProcess.exec(devScript, { cwd: basePath })

  if (process.env.DEBUG) {
    app.stdout.pipe(process.stdout)
    app.stderr.pipe(process.stderr)
  }

  const endStartupTime = timer(s)

  console.log(`Testing startup time and reload time of ${name}...`)

  await tryConnect(3000)

  const page = await browser.newPage()
  await page.goto(url)

  const startupTimeSeconds = endStartupTime()

  try {
    const reloadTimeHistogram = await runReloadTime(
      page,
      filePath,
      originalContent
    )

    table.push([
      name,
      startupTimeSeconds,
      reloadTimeHistogram.minNonZeroValue,
      reloadTimeHistogram.mean,
      reloadTimeHistogram.getValueAtPercentile(99),
      reloadTimeHistogram.maxValue,
    ])
  } finally {
    await page.close()
    fs.writeFileSync(filePath, originalContent)
    await kill(app.pid)
  }
}

async function run() {
  await runProjects()
}

run()
