const fs = require('fs')

module.exports = class SiteConfig {
  static uriList(){
    const siteSettings = JSON.parse(fs.readFileSync('./site_config.json', 'utf8'))
    return siteSettings.map((site)=>{
      return site.uri
    })
  }
}
