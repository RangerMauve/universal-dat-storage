# universal-dat-storage
Handle storing Dats in crazy environments

## Why?

Dealing with Storage in Dats is really fragmented. Beaker has it's own way of doing it, the Dat CLI has it's own way of doing it, random hypercore based projects have their own way of doing it, and all of that is incompatible with the web.

This module hopes to unify all these environments and have one place for all of Dat's storage needs.

## Goals

- [ ] Support Hyperdrives and Hypercores
- [ ] Take dat keys (buffer or URL) or file paths
- [ ] Standard folder for hypercore metadata. Use [env-paths data path](https://github.com/sindresorhus/env-paths#pathsdata)
- [ ] Detect how to get the Dat for a file path
  - Check for `.dat` folder, use [dat-storage](https://www.npmjs.com/package/dat-storage) if it exists.
  - Check for `.dat` file, identifies key to look up metadata in the standard place
- [ ] Check in Beaker's storage
  - Uses [app.getPath()](https://electronjs.org/docs/all#appgetpathname), with ["userData"](https://github.com/beakerbrowser/beaker/blob/bb80da5275ecfa1a2794913763ac1ba27ede6a54/app/background-process.js#L90), then ["Dat"](https://github.com/beakerbrowser/beaker-core/blob/5656854e3da75ba951a822f6c36147f31947b68e/dbs/archives.js#L26), and ["Archives" / "Meta" / `key.slice(0,2)` / `key.toString('hex')`](https://github.com/beakerbrowser/beaker-core/blob/5656854e3da75ba951a822f6c36147f31947b68e/dbs/archives.js#L37)
  - [ ] Create `.dat` file with a new key if nothing else exists
- [Corestore](https://github.com/andrewosh/random-access-corestore) integration? 

## API

```js
const Storage = require('universal-dat-storage')

const storage = new Storage({
  // Change the application name to use in the env-path module
  application: 'dat',
  
  // Only specify this if you really know what you're doing
  // Ideally data should be stored using env-paths to make operating systems happy
  storageLocation: null,
  
  // Whether we should search for keys in Beaker
  useBeaker: true,
  
  // Whether we should use the legacy `.dat` folder feature
  useDatFolder: true,
  
  // Whether we should use the new `.dat` file feature
  useDatFile: true
})

const key = DatEncoding.decode(`dat://somethingorother`)

// Get storage specific to hyperdrive (for the metadata and content feed)
const drive = hyperdrive(storage.getDrive(key))

// Get storage for a specific hypercore key
const core = hypercore(storage.getCore(key))
```
