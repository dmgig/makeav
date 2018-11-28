const files = require('../utils/files')
const error = require('../utils/error')
const Configstore = require('configstore')
const conf = new Configstore('makeav')
const moment = require('moment')
const ffmpeg = require('../utils/ffmpeg')
const fs = require('fs')
const C = require('../constants')

module.exports = async (args) => {

  try {
    const runtime = moment().format('YYYYMMDDHHmmss');
    const orderid = args.orderid || args.o
    const audiofile = args.audiofile || args.a
    const duration = args.duration || args.d || C.durationDefault
    const waveviz = args.waveviz || args.w || false
    const resize = args.resize || args.r || false
    const logofile = args.logo || args.l || C.logoFilename
    const outname = `${(args.outname || args.o || orderid)}-${runtime}.mp4`
    const outPath = `${conf.get('output_dir')}/${outname}`
    const workingPath = conf.get('workingDirPath')
    const orderPath = `${workingPath}/${orderid}`
    const resizedPath = `${orderPath}/${C.workingDir}`

    if(!orderid) error('ERROR: Order Id Required.')
    if(!audiofile) error('ERROR: Audiofile Required.')

    await ffmpeg.createSlideShow(orderPath, resizedPath, audiofile, resize, duration, logofile, waveviz, outPath)

  } catch (err) {
    error(err)
  }
}
