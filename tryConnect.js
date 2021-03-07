const net = require('net')

function tryConnect(port, retryInterval = 1000, maxRetries = 10) {
  return new Promise((resolve, reject) => {
    let retries = 0

    function run() {
      retries++

      net
        .connect({ port })
        .on('connect', function () {
          this.end()
          resolve()
        })
        .on('error', () => {
          if (retries > maxRetries) {
            return reject(new Error('max retries reached'))
          }

          setTimeout(run, retryInterval)
        })
    }

    setTimeout(run, retryInterval)
  })
}

module.exports = tryConnect
