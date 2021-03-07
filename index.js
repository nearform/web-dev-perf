const fs = require('fs')
const path = require('path')
const util = require('util')
const childProcess = require('child_process')
const puppeteer = require('puppeteer')
const hdr = require('hdr-histogram-js')
const kill = util.promisify(require('tree-kill'))
const Table = require('cli-table3')

const projects = require('./projects.json')
const tryConnect = require('./tryConnect')

const placeholder = '<div>placeholder</div>'
const iterations = 20
const url = 'http://localhost:3000'

async function runIterations(page, filePath, originalContent) {
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

    const start = process.hrtime()

    await page.waitForSelector(`#${id}`)

    const delta = process.hrtime(start)

    histogram.recordValue((delta[0] * 1e9 + delta[1]) / 1e6)
  }

  return histogram
}

async function runTests(browser) {
  const table = new Table({
    head: ['App', 'Min (ms)', 'Mean (ms)', '99th (ms)', 'Max (ms)'],
  })

  for (let project of projects) {
    const { dir, script, file } = project
    const basePath = path.join(__dirname, 'packages', dir)
    const filePath = path.join(basePath, file)
    const originalContent = fs.readFileSync(filePath, 'utf-8')

    const app = childProcess.exec(`npm run ${script}`, { cwd: basePath })

    await tryConnect(3000)

    const page = await browser.newPage()
    await page.goto(url)

    try {
      const histogram = await runIterations(
        page,
        filePath,
        originalContent,
        table
      )

      table.push([
        dir,
        histogram.minNonZeroValue,
        histogram.mean,
        histogram.getValueAtPercentile(99),
        histogram.maxValue,
      ])
    } finally {
      await page.close()
      fs.writeFileSync(filePath, originalContent)
      await kill(app.pid)
    }
  }

  console.log(table.toString())
}

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
  })

  console.log('Running', iterations, 'iterations')

  try {
    await runTests(browser)
  } finally {
    await browser.close()
  }
}

run()
