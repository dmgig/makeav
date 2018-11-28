const files = require('../utils/files')
const error = require('../utils/error')
const Configstore = require('configstore')
const conf = new Configstore('makeav')
const moment = require('moment')
const ffmpeg = require('../utils/ffmpeg')
const fs = require('fs')
const C = require('../constants')

module.exports = async (args) => {
    console.log('makeav conf', args)
  try {
    const runtime       = moment().format('YYYYMMDDHHmmss');
    const orderid       = args.orderid || args.o
    const audiofile     = args.audiofile || args.a
    const duration      = args.duration || args.d || C.durationDefault
    const wavevizmode   = args.wavevizmode || 'line'
    const wavevizcolor  = args.wavevizcolor || false
    const logofile      = args.logo || args.l || C.logoFilename
    const outname       = `${(args.outname || args.o || orderid)}-${runtime}.mp4`
    const outPath       = `${conf.get('outputDirPath')}/${outname}`
    const workingPath   = conf.get('workingDirPath')
    const orderPath     = `${workingPath}/${orderid}`
    const slideshowPath = `${orderPath}/slideshow`
    const resizedPath   = `${orderPath}/${C.workFilesDir}`

    if(!orderid) error('ERROR: Order Id Required.')
    if(!audiofile) error('ERROR: Audiofile Required.')

    console.log('makeav conf', args)

    await ffmpeg.createSlideShow(orderPath, resizedPath, slideshowPath, audiofile, duration, logofile, wavevizcolor, wavevizmode, outPath)

  } catch (err) {
    error(err)
  }
}
