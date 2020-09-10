const fs = require('fs')
const readline = require('readline')
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
    const data = { uri, healthy, statusCode, responseTime, checkTime }

    return fs.promises.writeFile(this.generateFilePath(uri), `\n${JSON.stringify(data)}`, {flag: 'a'})
  }

  getHealthData(uri, startCheckTime, endCheckTime){
    const input = fs.createReadStream(this.generateFilePath(uri))
    const rl = readline.createInterface({ input })
    const matchedList = []

    return new Promise((resolve, reject)=>{
      try {
        rl.on('line', (line) => {
          try {
            const data = JSON.parse(line)
            const checkTime = new Date(data.checkTime).getTime()
            if(startCheckTime.getTime() <= checkTime && checkTime <= endCheckTime.getTime()){
              matchedList.push(data)
            }
          } catch (_) {
            // Ignore error
          }
        })

        rl.on('close', () => {
          resolve(matchedList)
        })
      } catch (err) {
        reject(err)
      }
    })
  }

  generateFilePath(uri){
    const fileName = `${URLSafeBase64.encode(uri)}.txt`
    return path.join(this.fileDir, fileName)
  }
}
