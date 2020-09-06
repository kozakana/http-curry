const SiteConfig = require('./SiteConfig.js')
const DataBase = require('./db/TextFileDataBase.js')

const https = require('https')

const TIMEOUT = 200

const db = new DataBase()

const uris = SiteConfig.uriList()

checkList = uris.map((uri)=>{
  return new Promise((resolve, reject)=>{
    const start = new Date()
    const req = https.get(uri, {timeout: TIMEOUT}, function(res) {
      console.log(`URL: ${uri}`)
      console.log(`STATUS: ${res.statusCode}`)
      console.log(`ResponseTime: ${new Date() - start}ms`)

      db.setHealthData(uri, true, res.statusCode, new Date() - start, new Date()).then(()=>{
        resolve()
      })
    })

    req.on('error', function(err) {
      console.log("Error: " + err.message)
      reject()
    })
  })
})

Promise.all(checkList).then(()=>{
  console.log('done')
})
