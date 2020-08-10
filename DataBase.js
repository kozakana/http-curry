module.exports = class DataBase {
  deleteSiteData(uriId){
    throw new Error("deleteSiteData method must be overridden.")
  }

  setHealthData(uriId, siteStatus, statusCode, responseTime, checkTime){
    throw new Error("setHealthData method must be overridden.")
  }
}
