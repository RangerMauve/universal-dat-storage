const fs = require('fs')
const raf = require('random-access-file')
const envPaths = require('env-paths')
const DatEncoding = require('dat-encoding')
const datStorage = require('dat-storage')
const path = require('path')

class DatStorage {
  constructor ({
    application = 'dat',
    storageLocation = null,
    useDatFolder = true,
    useBeaker = true,
    useDatFile = true
  }) {
    this.storageLocation = storageLocation || envPaths(application).data

    this.useDatFolder = useDatFolder
    this.useBeaker = useBeaker
    this.useDatFile = useDatFile
  }

  getDrive (location) {
    try {
      return this.getKeyStoreage(location)
    } catch (e) {
      // It was probably not a dat key
    }

    try {
      const mainDatFolder = path.join(process.cwd(), location)
      const relativeFolderLocation = path.join(mainDatFolder, '.dat')
      const stat = fs.statSync(relativeFolderLocation)
      if (this.useDatFolder && stat.isDirectory()) {
        return datStorage(mainDatFolder)
      } else if (this.useDatFile && stat.isFile()) {
        // Hopefully this is a `dat://` key
        const contents = fs.readFileSync(relativeFolderLocation, 'utf-8')
        return this.getDrive(contents)
      }
    } catch (e) {
      // It was probably not a directory or datfile
    }

    throw new Error('Unable to create storage')
  }

  getCore (key) {
    return this.getKeyStoreage(key)
  }

  getKeyStoreage (location) {
    const key = DatEncoding.decode(location)
    const stringKey = DatEncoding.encode(key)

    // Using same path as corestore
    // https://github.com/andrewosh/random-access-corestore/blob/master/index.js#L80
    const storageLocation = path.join(
      this.storageLocation,
      stringKey.slice(0, 2),
      stringKey.slice(2, 4),
      stringKey)

    return (file) => raf(path.join(storageLocation, file))
  }
}

module.exports = (options) => new DatStorage(options)

module.exports.DatStorage = DatStorage
