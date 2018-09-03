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
    const waveviz = args.waveviz || args.w || false
    const duration = args.duration || args.d || C.durationDefault
    const outname = `${(args.outname || args.o || orderid)}-${runtime}.mp4`
    const outPath = `${conf.get('output_dir')}/${outname}`
    const logofile = args.logofile || args.l || C.logoFilename
    const workingPath = conf.get('working_dir')
    const orderPath = `${workingPath}/${orderid}`
    const resizedPath = `${orderPath}/${C.workingDir}`
    const imageFiles = await files.getListOfImageFiles(resizedPath)

    if(!orderid) error('ERROR: Order Id Required.')
    if(!audiofile) error('ERROR: Audiofile Required.')

    await ffmpeg.createSlideShow(orderPath, resizedPath, audiofile, duration, imageFiles, logofile, waveviz, outPath)

  } catch (err) {
    error(err)
  }
}
