const TextFileDataBase = require('./db/TextFileDataBase.js')
const DynamoDBDataBase = require('./db/DynamoDBDataBase.js')
const https = require('https')

module.exports = class HealthCheck {
  constructor(siteConfig, dbType, dbOption={}) {
    this.siteConfig = siteConfig
    if(dbType === 'DynamoDB'){
      this.db = new DynamoDBDataBase(dbOption)
    } else {
      this.db = new TextFileDataBase(dbOption)
    }
  }

  insertData(){
    const checkList = this.siteConfig.map((site)=>{
      const uri = site.uri

      return new Promise((resolve, reject)=>{
        const start = new Date()
        const req = https.get(uri, (res)=>{
          const end = new Date()
          const responseTime = end - start
  
          const health = this.checkHealth(res.statusCode, responseTime, res.body)
          this.db.setHealthData(uri, health, res.statusCode, responseTime, end).then(()=>{
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

  checkHealth(statusCode, responseTime, body){
    let health = 'healthy'

    const sc = this.statusCodeCheck(statusCode)
    if(sc === 'critical'){
      return sc
    } else if(sc){
      health = sc
    }

    const rt= this.responseTimeCheck(responseTime)
    if(rt === 'critical'){
      return rt
    } else if(rt){
      health = rt
    }

    const includeStr = this.includeStrCheck(body)
    if(includeStr === 'critical'){
      return includeStr
    } else if(includeStr){
      health = includeStr
    }

    const docRegex = this.docRegexCheck(body)
    if(docRegex === 'critical'){
      return docRegex
    } else if(docRegex){
      health = docRegex
    }

    return health
  }

  statusCodeCheck(statusCode){
    const crit = this.siteConfig.critical || {}
    const warn = this.siteConfig.warning || {}

    if(statusCode !== (crit.statusCode || 200)){
      return 'critical'
    } else if(statusCode !== (warn.statusCode || 200)){
      return 'warning'
    } else {
      return null
    }
  }

  responseTimeCheck(responseTime){
    const crit = this.siteConfig.critical || {}
    const warn = this.siteConfig.warn || {}

    if(responseTime > (crit.responseTime || 3000)){
      return 'critical'
    } else if(responseTime > (warn.responseTime || 3000)){
      return 'warning'
    } else {
      return null
    }
  }

  includeStrCheck(body){
    const crit = this.siteConfig.critical || {}
    const warn = this.siteConfig.warn || {}

    if(crit.includeStr && body.includes(crit.includeStr)){
      return 'critical'
    } else if(warn.includeStr && body.includes(warn.includeStr)){
      return 'warning'
    } else {
      return null
    }
  }

  docRegexCheck(body){
    const crit = this.siteConfig.critical || {}
    const warn = this.siteConfig.warn || {}

    if(crit.docRegex && body.match(new RegExp(crit.docRegex))){
      return 'critical'
    } else if(warn.docRegex && body.match(new RegExp(crit.docRegex))){
      return 'warning'
    } else {
      return null
    }
  }
}
