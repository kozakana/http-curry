const AWS = require('aws-sdk')
const DataBase = require('./DataBase.js')

/*
 * [HttpCurry_ResponseData Table]
 * Primary partition key: siteURI (String)
 * Primary sort key: checkTime (Number)
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
      responseData: option.tableName.responseData || 'HttpCurry_ResponseData'
    }
  }

  deleteSiteData(uri){
    const params = {
      TableName: this.tableName.responseData,
      ExpressionAttributeNames: {'#uri': 'siteURI'},
      ExpressionAttributeValues: {':val': uri},
      KeyConditionExpression: '#uri = :val'
    }

    return new Promise((resolve, reject)=>{
      this.docClient.query(params, (err, data)=>{
        if(err){
          reject(err)
        }else{
          const deleteList = data.Items.map((item)=>{
            return new Promise((res, rej)=>{
              this.docClient.delete({
                TableName: this.tableName.responseData,
                Key: {
                  siteURI: item.siteURI,
                  checkTime: item.checkTime
                }
              }, (err, data)=>{
                if(err){
                  rej(err)
                } else {
                  res(data)
                }
              })
            })
          })

          Promise.all(deleteList).then((result)=>{
            resolve(result)
          })
        }
      })
    })
  }

  setHealthData(uri, healthy, statusCode, responseTime, checkTime){
    const params = {
      TableName: this.tableName.responseData,
      Item:{
        siteURI: uri,
        checkTime: checkTime.getTime(),
        healthy: true,
        statusCode: statusCode,
        responseTime: responseTime,
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

  getHealthData(uri, startCheckTime, endCheckTime){
    const params = {
      TableName: this.tableName.responseData,
      ExpressionAttributeNames: {
        '#uri': 'siteURI',
        '#dt': 'checkTime'
      },
      ExpressionAttributeValues: {
        ':uri': uri,
        ':start': startCheckTime.getTime(),
        ':end': endCheckTime.getTime(),
      },
      KeyConditionExpression: '#uri = :uri AND #dt BETWEEN :start AND :end'
    }

    return new Promise((resolve, reject)=>{
      this.docClient.query(params, (err, data)=>{
        const items = data.Items.map((item)=>{
          return {
            uri: item.siteURI,
            checkTime: new Date(item.checkTime),
            healthy: item.healthy,
            statusCode: item.statusCode,
            responseTime: item.responseTime,
          }
        })

        if(err){
          reject(err)
        }else{
          resolve(items)
        }
      })
    })
  }
}
