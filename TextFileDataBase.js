const fs = require('fs')
const path = require('path')
const DataBase = require('./DataBase.js')
const URLSafeBase64 = require('urlsafe-base64')

module.exports = class TextFileDataBase extends DataBase {
  constructor(option={}) {
    super()
    this.fileDir = option.fileDir || './data'
    if (!fs.existsSync(this.fileDir)) fs.mkdirSync(this.fileDir)
  }

  deleteSiteData(uri){
    return fs.promises.unlink(this.generateFilePath(uri))
  }

  deleteAllSiteData(uri){
    return fs.promises.unlink(this.generateFilePath(uri))
  }

  setHealthData(uri, healthy, statusCode, responseTime, checkTime){
    const data = { healthy, statusCode, responseTime, checkTime }

    return fs.promises.writeFile(this.generateFilePath(uri), `\n${JSON.stringify(data)}`, {flag: 'a'})
  }

  generateFilePath(uri){
    const fileName = `${URLSafeBase64.encode(uri)}.txt`
    return path.join(this.fileDir, fileName)
  }
}
