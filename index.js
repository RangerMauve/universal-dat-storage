const fs = require('fs-extra')
const raf = require('random-access-file')
const envPaths = require('env-paths')
const DatEncoding = require('dat-encoding')
const datStorage = require('dat-storage')
const path = require('path')
const secretStorage = require('dat-secret-storage')

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

  getLocation (location) {
    const key = DatEncoding.decode(location)
    const stringKey = DatEncoding.encode(key)

    // Using same path as corestore
    // https://github.com/andrewosh/random-access-corestore/blob/master/index.js#L80
    return path.join(
      this.storageLocation,
      stringKey.slice(0, 2),
      stringKey.slice(2, 4),
      stringKey)
  }

  delete (key, cb) {
    const location = this.getLocation(key)
    fs.remove(location, cb)
  }

  getDrive (location) {
    try {
      return this.getKeyStoreage(location)
    } catch (e) {
      // It was probably not a dat key
    }

    try {
      const mainDatFolder = path.resolve(process.cwd(), location)
      const relativeFolderLocation = path.join(mainDatFolder, '.dat')
      const stat = fs.statSync(relativeFolderLocation)
      if (this.useDatFolder && stat.isDirectory()) {
        const contentDataLocation = path.join(relativeFolderLocation, 'content.data')
        if (fs.existsSync(contentDataLocation)) {
          // Save content feed to the folder
          return datStoreStorage(relativeFolderLocation)
        } else {
          // Use files as files storage
          return datStorage(mainDatFolder)
        }
      } else if (this.useDatFile && stat.isFile()) {
        // Hopefully this is a `dat://` key
        const contents = fs.readFileSync(relativeFolderLocation)
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

  getCoreStore (name) {
    const storageLocation = path.join(
      this.storageLocation,
      name
    )
    return (file) => raf(path.join(storageLocation, file))
  }

  getKeyStoreage (location) {
    const storageLocation = this.getLocation(location)

    // If we have metadata stored locally, use names instead of folders
    const metadataDataFile = path.join(storageLocation, 'metadata.data')
    if(fs.existsSync(metadataDataFile)) {
      return datStoreStorage(storageLocation)
    }

    return (file) => raf(path.join(storageLocation, file))
  }
}

module.exports = (options) => new DatStorage(options)

module.exports.DatStorage = DatStorage

function datStoreStorage (storage) {
  return {
    metadata: function (name, opts) {
      // I don't think we want this, we may get multiple 'ogd' sources
      if (name === 'secret_key') return secretStorage()(path.join(storage, 'metadata.ogd'), { key: opts.key, discoveryKey: opts.discoveryKey })
      return raf(path.join(storage, 'metadata.' + name))
    },
    content: function (name, opts) {
      return raf(path.join(storage, 'content.' + name))
    }
  }
}
