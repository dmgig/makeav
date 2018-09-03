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
    const outname = `${(args.outname || args.o || orderid)}-${runtime}.mp4`
    const outPath = `${conf.get('output_dir')}/${outname}`
    const staticFile = args.static || args.s || false
    const logoFile = args.logo || args.l || C.logoFilename
    const workingPath = conf.get('workingDirPath')
    const orderPath = `${workingPath}/${orderid}`
    const resizedPath = `${orderPath}/${C.workingDir}`
    const imageFiles = await files.getListOfImageFiles(resizedPath)

    if(!orderid) error('ERROR: Order Id Required.', true)
    if(!audiofile) error('ERROR: Audiofile Required.', true)
    if(!logoFile) error('ERROR: Logo Image Required.', true)
    if(!staticFile) error('ERROR: Static Image Required.', true)

    await ffmpeg.createStaticShow(orderPath, resizedPath, audiofile, logoFile, staticFile, waveviz, outPath)

  } catch (err) {
    error(err)
  }
}
