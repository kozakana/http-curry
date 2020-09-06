const AWS = require('aws-sdk')
const DataBase = require('./DataBase.js')

/*
 * [HttpCurryResponseData Table]
 * Primary partition key: siteURI (String)
 * Primary sort key: requestDatetime (Number)
 */

module.exports = class DynamoDBDataBase extends DataBase {
  constructor(option={}) {
    super()

    if(option.loadFromPath){
      AWS.config.loadFromPath(option.loadFromPath)
    } else if(option.credentials) {
      const creds = option.credentials
      const awsCredentials = new AWS.Credentials({
        accessKeyId: creds.accessKeyId, secretAccessKey: creds.secretAccessKey, sessionToken: creds.sessionToken
      })
      AWS.config.update({
        credentials: awsCredentials,
        region: option.region
      })
    } else if(option.profile) {
      const awsCredentials = new AWS.SharedIniFileCredentials({profile: option.profile})
      AWS.config.update({
        credentials: awsCredentials,
        region: option.region
      })
    }

    this.docClient = new AWS.DynamoDB.DocumentClient()

    option.tableName = option.tableName || {}
    this.tableName = {
      responseData: option.tableName.responseData || 'HttpCurryResponseData'
    }
  }

  deleteSiteData(uri){
    return fs.promises.unlink(this.generateFilePath(uri))
  }

  deleteAllSiteData(uri){
    return fs.promises.unlink(this.generateFilePath(uri))
  }

  setHealthData(uri, healthy, statusCode, responseTime, checkTime){
    const params = {
      TableName: this.tableName.responseData,
      Item:{
        siteURI: uri,
        requestDatetime: (new Date()).getTime(),
        healthy: true,
        statusCode: statusCode,
        responseTime: responseTime,
        checkTime: checkTime.getTime()
      }
    }

    return new Promise((resolve, reject)=>{
      this.docClient.put(params, (err, data)=>{
        if (err) {
          reject(err)
        } else {
          resolve(data)
        }
      })
    })
  }

  generateFilePath(uri){
    const fileName = `${URLSafeBase64.encode(uri)}.txt`
    return path.join(this.fileDir, fileName)
  }
}
