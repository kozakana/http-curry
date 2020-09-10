const TextFileDataBase = require('./db/TextFileDataBase.js')
const DynamoDBDataBase = require('./db/DynamoDBDataBase.js')
const https = require('https')

module.exports = class HealthCheck {
  constructor(dbType, dbOption={}, option={}) {
    this.timeout = option.timeout || 3000
    if(dbType === 'DynamoDB'){
      this.db = new DynamoDBDataBase(dbOption)
    } else {
      this.db = new TextFileDataBase(dbOption)
    }
  }

  healthCheck(uris){
    const checkList = uris.map((uri)=>{
      return new Promise((resolve, reject)=>{
        const start = new Date()
        const req = https.get(uri, {timeout: this.timeout}, (res)=>{
          const end = new Date()
          const responseTime = end - start
  
          this.db.setHealthData(uri, true, res.statusCode, responseTime, end).then(()=>{
            resolve({uri, status: res.statusCode, responseTime})
          })
        })
  
        req.on('error', (err)=>{
          reject(err)
        })
      })
    })
  
    return new Promise((resolve, reject)=>{
      Promise.all(checkList).then((res)=>{
        resolve(res)
      }).catch((err)=>{
        reject(err)
      })
    })
  }
}
