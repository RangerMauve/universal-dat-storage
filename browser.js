const DatEncoding = require('dat-encoding')
const path = require('path')
const RAW = require('random-access-web')

class DatStorage {
  constructor ({
    application = 'dat',
    maxSize
  }) {
    this._storage = RAW({
      name: application,
      maxSize
    })
  }

  getLocation (location) {
    const key = DatEncoding.decode(location)
    const stringKey = DatEncoding.encode(key)

    return stringKey
  }

  delete (key, cb) {
    // TODO: Figure out how to delete folders in the different web transports
    setTimeout(() => {
      cb(new Error('Cannot delete storage on Web yet'))
    }, 0)
  }

  getDrive (location) {
    try {
      return this.getKeyStoreage(location)
    } catch (e) {
      // It was probably not a dat key
    }

    return (file) => this._storage(path.join(location, file))
  }

  getCore (key) {
    return this.getKeyStoreage(key)
  }

  getCoreStore (name) {
    return (file) => this._storage(path.join(name, file))
  }

  getKeyStoreage (location) {
    const key = DatEncoding.decode(location)
    const stringKey = DatEncoding.encode(key)

    return (file) => this._storage(path.join(stringKey, file))
  }
}

module.exports = (options) => new DatStorage(options)

module.exports.DatStorage = DatStorage
