const Alert = require('./Alert.js')
const HealthCheck = require('./HealthCheck.js')

module.exports = class HttpCurry {
  constructor(siteConfig, db){
    this.siteConfig = siteConfig
    this.dbType = db.type
    this.dbOption = db.option
  }

  healthCheck(){
    const healthCheck = new HealthCheck(this.siteConfig, this.dbType, this.dbOption)

    return healthCheck.insertData()
  }

  alert(type, alertOption){
    const alert = new Alert(this.siteConfig, this.dbType, this.dbOption)

    return alert.checkAndSend(type, alertOption)
  }
}
