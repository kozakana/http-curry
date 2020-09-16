// healthy is less than or equal 0
module.exports.healthStatuses = {
  healthy: 0,
  warning: 5,
  critical: 7
}

module.exports.isHealthy = (status)=>{
  return status <= this.healthStatuses.healthy
}
