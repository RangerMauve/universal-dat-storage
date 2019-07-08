const test = require('tape')
const crypto = require('hypercore-crypto')
const hyperdrive = require('hyperdrive')
const hypercore = require('hypercore')

const datStorage = require('./')

const isBrowser = process.title === 'browser'
const storageLocation = isBrowser ? '/' : require('tmp').dirSync({
  prefix: 'universal-dat-storage-'
}).name

const storage = datStorage({
  application: 'tests',
  storageLocation
})

test('getCore', (t) => {
  const { publicKey, secretKey } = crypto.keyPair()

  const core = hypercore(storage.getCore(publicKey), publicKey, {
    secretKey
  })

  core.append('hello world', (err1) => {
    t.notOk(err1, 'no error writing')
    core.close(() => {
      const reloadedCore = hypercore(storage.getCore(publicKey))
      reloadedCore.get(0, {
        valueEncoding: 'utf-8'
      }, (err2, data) => {
        t.notOk(err2, 'no error reading')
        t.equals(data, 'hello world')
        reloadedCore.append('goodbye world', (err3) => {
          t.notOk(err3, 'able to write after reload')
          reloadedCore.close(() => {
            t.end()
          })
        })
      })
    })
  })
})

// Existing folders don't work on the web
if(!isBrowser) {
  test('getDrive - folder', (t) => {
    const drive = hyperdrive(storage.getDrive('./example'), {
      latest: true
    })

    drive.readFile('example.txt', 'utf-8', (err, data) => {
      t.notOk(err, 'no error writing')
      drive.close(() => {
        t.end()
      })
    })
  })
}

test('getDrive - key', (t) => {
  const { publicKey, secretKey } = crypto.keyPair()

  const drive = hyperdrive(storage.getDrive(publicKey), publicKey, {
    secretKey
  })

  drive.writeFile('/example.txt', 'Hello World!', (err) => {
    t.notOk(err, 'able to write')

    drive.close(() => {
      const reloadedDrive = hyperdrive(storage.getDrive(publicKey))

      reloadedDrive.readFile('/example.txt', (err, data) => {
        t.notOk(err, 'able to read after loading')
        reloadedDrive.close(() => {
          t.end()
        })
      })
    })
  })
})
