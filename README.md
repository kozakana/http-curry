# HTTP Curry
This npm library is HTTP health check which can be used as easily as eating curry.

## Features

**Run Easy, Run Anywhere**

* Supports many storages
* Supports inexpensive storages
* Uses Node.js that runs on various serverless services

## Installation

```
npm install http-curry
```

## Usage
Recommended to use in scheduled task like cron.

### Code sample
```
const fs = require('fs')
const HttpCurry = require('http-curry')

const siteConfig = JSON.parse(fs.readFileSync('./site_config.json', 'utf8'))
const httpCurry = new HttpCurry(siteConfig, 'text')

httpCurry.healthCheck().then(()=>{
  httpCurry.Alert('slack')
})
```

### site_config.json
```
[
  { "uri": "https://example.com/" },
  {
    "uri": "https://example.com/posts/123",
    "conditions": {
      "warning": {
        "times": 3,
        "responseTime": 1000,
        "statusCode": 200,
        "includeStr": "postID=123",
        "docRegex": "^<!DOCTYPE html>"
      },
      "critical": {
        "times": 5,
        "responseTime": 3000,
        "statusCode": 200,
        "includeStr": "postID=123",
        "docRegex": "^<!DOCTYPE html>"
      }
    }
  }
],
```

## Roadmap

### Healthcheck item
* Remaining domain period
* Remaining period of certificate

### DB
* Cloud Firestore
* Azure Table Storage
* MongoDB
* RDB(supported by Sequelize)
* (Cloud Strages(S3 CloudStrage BlobStorage))
* (Athena)

### Other
* http
* Testing
* Better error handling
* Mention users in Slack
* Add alert methods
* Methods for creating GUI

## DB

### store to text file
Text file store is easiest to use. But not recommended. Text file store is restricted using location. For example, It doesn't work as expected on Lambda.

### store to DynamoDB
DynamoDB is recommended when using in AWS.

## HealthCheck

```
httpCurry.healthCheck().then(()=>{
  console.log('done')
}).catch((err)=>{
  console.log(err)
})
```

## Alert

### Alert to slack channel
```
const params = {
  path: 'https://hooks.slack.com/services/XXXXXXX/XXXXXXX/XXXXXXX',
  channel: '#alert',
  username: 'http-curry',
  icon_emoji: ':ghost:'
}
httpCurry.alert('slack', params).then(()=>{
  console.log('done')
}).catch((err)=>{
  console.log(err)
})
```

### Alert by email

#### not use SMTP server
```
const params = {
  from: 'from@example.com',
  to: 'to@example.com',
  subject: 'alert'
}
httpCurry.alert('email', params).then(()=>{
  console.log('done')
}).catch((err)=>{
  console.log(err)
})
```

### using SMTP server
See [node-sendmail](https://github.com/guileen/node-sendmail) for detaild options.

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License

## :curry:
This npm is for curry lovers all over the world.
