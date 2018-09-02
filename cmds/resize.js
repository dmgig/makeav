const files = require('../utils/files')
const error = require('../utils/error')
const Configstore = require('configstore')
const conf = new Configstore('makeav')
const ffmpeg = require('../utils/ffmpeg')
const fs = require('fs');

module.exports = async (args) => {

  try {
    const orderid = args.orderid || args.o
    const orderpath = `${conf.get('working_dir')}/${orderid}`
    const resizedpath = `${orderpath}/resized`
    const imageFiles = await files.getListOfImageFiles(orderpath)
    try{
      fs.mkdirSync(resizedpath)
    }catch(err){}
    console.log(imageFiles)
    imageFiles.forEach((el, i) => {
      console.log(`${orderpath}/${el}`)
      ffmpeg.resizeImage(i, `${orderpath}/${el}`, resizedpath)
    })

  } catch (err) {
    error(err)
  }
}
