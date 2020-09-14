const DataBase = require('./db/DataBase.js')
const TextFileDataBase = require('./db/TextFileDataBase.js')
const DynamoDBDataBase = require('./db/DynamoDBDataBase.js')
const { IncomingWebhook } = require('@slack/webhook')
const { healthStatuses, isHealthy } = require('./constants.js')
const sendmail = require('sendmail')();

module.exports = class Alert {
  constructor(siteConfig, dbType, dbOption={}, option={}) {
    this.siteConfig = siteConfig
    if(dbType === 'DynamoDB'){
      this.db = new DynamoDBDataBase(dbOption)
    } else {
      this.db = new TextFileDataBase(dbOption)
    }
  }

  checkAndSend(type, option){
    const results = this.siteConfig.map((site)=>{
      const times = site.critical && site.critical.conditions && site.critical.conditions.times || 1

      return new Promise((resolve, reject)=>{
        this.db.getRecentlyHealthData(site.uri, times).then((items)=>{
          let health = healthStatuses.healthy
          items.forEach((item)=>{
            if(!isHealthy(item.health)){
              if(health < item.health) health = item.health
            }
          })

          if(isHealthy(health)){
            resolve(null)
          } else {
            if(health === healthStatuses.critical){
              resolve(`${site.uri} is critical`)
            } else if(health === healthStatuses.warning){
              resolve(`${site.uri} is warning`)
            } else {
              reject('undefined health status')
            }
          }
        }).catch((err)=>{
          reject(err)
        })
      })
    })

    return new Promise((resolve, reject)=>{
      Promise.all(results).then((res)=>{
        // exists error message
        if(res.some(r=>r)){
          this.sendAlert(type, res.join("\n"), option)
        }
        resolve()
      }).catch((err)=>{
        reject(err)
      })
    })
  }

  sendAlert(type, message, option){
    if(type === 'slack'){
      this.slack(message, option)
    } else if(type === 'email'){
      this.email(message, option)
    }
  }

  slack(message, option){
    const webhook = new IncomingWebhook(option.path)
    option.text = message

    return webhook.send(option)
  }

  email(message, option){
    option.text = message

    return new Promise((resolve, reject)=>{
      sendmail(option, (err, reply)=>{
        if(err){
          reject(err.stack)
        }else{
          resolve(reply)
        }
      })
    })
  }
}
