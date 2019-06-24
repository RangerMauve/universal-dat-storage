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

  getDrive (location) {
    try {
      return this.getKeyStoreage(location)
    } catch (e) {
      // It was probably not a dat key
    }

    return (file) => this._storage(path.join('/', location, file))
  }

  getCore (key) {
    return this.getKeyStoreage(key)
  }

  getKeyStoreage (location) {
    const key = DatEncoding.decode(location)
    const stringKey = DatEncoding.encode(key)

    return (file) => this._storage(path.join(stringKey, file))
  }
}

module.exports = (options) => new DatStorage(options)

module.exports.DatStorage = DatStorage
