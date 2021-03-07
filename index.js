const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')
const puppeteer = require('puppeteer')
const hdr = require('hdr-histogram-js')
const kill = require('util').promisify(require('tree-kill'))

const projects = require('./projects.json')

const placeholder = '<div>placeholder</div>'
const iterations = 5
const url = 'http://localhost:3000'

async function runIterations(page, filePath, originalContent, histogram) {
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
}

async function runTests(browser) {
  for (let project of projects) {
    const { dir, script, file } = project
    const basePath = path.join(__dirname, 'packages', dir)
    const filePath = path.join(basePath, file)
    const originalContent = fs.readFileSync(filePath, 'utf-8')

    const app = childProcess.exec(`npm run ${script}`, { cwd: basePath })

    const page = await browser.newPage()
    await page.goto(url)

    const histogram = hdr.build()

    try {
      await runIterations(page, filePath, originalContent, histogram)

      console.log(dir)
      console.log(histogram)
    } finally {
      fs.writeFileSync(filePath, originalContent)
      await kill(app.pid)
    }
  }
}

async function run() {
  const browser = await puppeteer.launch({
    headless: false,
  })

  try {
    await runTests(browser)
  } finally {
    await browser.close()
  }
}

run()
