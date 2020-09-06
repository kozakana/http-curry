const AWS = require('aws-sdk')

module.exports = class TextFileDataBase extends DataBase {
  constructor(option={}) {
    super()

    if(option.loadFromPath){
      AWS.config.loadFromPath(option.loadFromPath)
    } else if(option.credentials) {
      const creds = option.credentials
      const awsCredentials = new AWS.Credentials({
        accessKeyId: creds.accessKeyId, secretAccessKey: creds.secretAccessKey, sessionToken: creds.sessionToken
      })
      AWS.config.credentials = awsCredentials
    } else if(option.profile) {
      const awsCredentials = new AWS.SharedIniFileCredentials({profile: option.profile});
      AWS.config.credentials = awsCredentials
    }

    option.tablePrefix
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
