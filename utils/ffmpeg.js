const ffmpeg = require('fluent-ffmpeg')
const im = require('imagemagick')
const fs = require('fs')
const async = require("async")
const path = require("path")
const Configstore = require('configstore')
const conf = new Configstore('makeav')
const files = require("../utils/files")
const C = require("../constants")
const error = require('../utils/error')
const animated = require('animated-gif-detector')

module.exports = {

  resizeImage: (inPath, outPath, orderPath, callback) => {
    ffmpeg(inPath)
      .videoFilter("format=rgba")
      .videoFilter('scale=iw*min(960/iw\\,540/ih):ih*min(960/iw\\,540/ih)')
      .videoFilter("pad=960:540:(960-iw)/2:(480-ih)/2:color=00000000")
      .on('start', function(commandLine) {
        // console.log('Command: ' + commandLine);
        console.log(`Starting 'resizeImage'...`);
      })
      .on('error', function(err) {
        console.log('Error: ' + err.message);
      })
      .on('end', function() {
        return callback(null, true)
        console.log('Resizing image finished!');
      })
      .save(outPath)
  },

  createSlideShow: (orderPath, resizedPath, slideshowPath, audiofile, resize, duration, logoFile, wavevizcolor, wavevizmode, outPath) => {
    const logoPath = `${orderPath}/${logoFile}`

    if(!fs.existsSync(slideshowPath)){
      error('No slideshow path set. Slideshow images should be in the following directory: working/{order_id}/slideshow');
    }

    let resizedImages = []
    try{
      fs.mkdirSync(resizedPath)
    }catch(err){}

    const promise = files.getListOfImageFiles(slideshowPath)
    promise.then(function(imageFiles){
      const TASKS = [];
      let task;

      // add logo
      task = function(callback){
        module.exports.resizeImage(`${orderPath}/${logoFile}`, `${orderPath}/resized-${logoFile}`, orderPath, callback)
      }
      TASKS.push(task)

      if(resize){
        for(let i in imageFiles){
          task = function(callback){
            const id = parseInt(i) + 1
            const outPath = `${resizedPath}/${C.imgPrefix}-${id.toString().padStart(3, '0')}.png`
            module.exports.resizeImage(`${slideshowPath}/${imageFiles[i]}`, outPath, orderPath, callback)
          }
          TASKS.push(task)
        }
      }

      task = function(callback) {
        const promise = files.getListOfImageFiles(resizedPath)
        promise.then(function(images){
          resizedImages = images
          callback(null, 1)
        });
      }
      TASKS.push(task)

      task = function(callback) {
        module.exports.makeSlideShow(orderPath, resizedPath, logoFile, duration, resizedImages, callback)
      }
      TASKS.push(task)

      task = function(callback) {
        module.exports.makeSlideShowList(orderPath, resizedPath, callback)
      }
      TASKS.push(task)

      task = function(callback) {
        module.exports.combineFinalSlideShow(orderPath, resizedPath, audiofile, duration, resizedImages, logoFile, wavevizcolor, wavevizmode, outPath, callback)
      }
      TASKS.push(task)

      async.series(TASKS,
      function(err, results) {
        console.log(results)
      });
    });
  },

  makeSlideShow: (orderPath, resizedPath, logoFile, duration, imageFiles, callback) => {
    console.log('makeSlideshow')
    const slideshow = `${resizedPath}/${C.slideshowFilename}.mp4`
    const ffCmd = ffmpeg();

    if(imageFiles.length === 0)
      error(`No images in slideshow. Try to use the resize flag: -r=1.`, 1)

    imageFiles.forEach((el, i) => {
      ffCmd.addInput(`${resizedPath}/${el}`).loop();
    })

    // build complex filter string
    let complexFilter = '';
    imageFiles.forEach((el, i) => {
      complexFilter = `${complexFilter} [${i}:v]trim=duration=${duration},fade=t=in:st=0:d=1,fade=t=out:st=${duration-1}:d=1,setsar=1:1[v${i}]; `
    })
    imageFiles.forEach((el, i) => {
      complexFilter = `${complexFilter} [v${i}]`
    })
    complexFilter = `${complexFilter}concat=n=${imageFiles.length}:v=1:a=0,setsar=1:1[v]`
    ffCmd.complexFilter(complexFilter);

    ffCmd.outputOptions(
      '-map', '[v]',
      '-aspect', '16:9',
      '-codec', 'png',
      '-r', '24'
    );

    // finalize
    ffCmd.on('start', function(commandLine) {
      // console.log('Command: ' + commandLine);
      console.log(`Starting 'makeSlideshow'...`);
    })
    .on('progress', function(progress) {
      console.log(`Sildeshow: ${progress.timemark}`);
    })
    .on('error', function(err) {
      console.log('Error: ' + err.message);
    })
    .on('end', function() {
      console.log('Processing slideshow finished!');
      return callback(null, 1)
    })
    ffCmd.save(slideshow);

  },

  makeSlideShowList: (orderPath, resizedPath, callback) => {
    console.log('makeSlideshowList')
    const slidelist = `${resizedPath}/${C.slidelistTxt}`
    let string = ''
    for(i=0; i<500; i++){
      string = `${string}file '${C.slideshowFilename}.mp4'\n`
    }
    let options = { 'encoding': 'utf8', 'mode': 0755 }
    fs.writeFile(slidelist, string, options, (err) => {
      if (err) throw err;
      console.log('slidelist written')
      return callback(null, 2)
    });
  },

  combineFinalSlideShow: (orderPath, resizedPath, audiofile, duration, imageFiles, logofile, wavevizcolor, wavevizmode, outPath, callback) => {
    console.log('combineFinalSlideshow')
    const slidelist = `${resizedPath}/${C.slidelistTxt}`
    const slideshow = `${resizedPath}/${C.slideshowFilename}.mp4`
    const logoPath = `${orderPath}/resized-${logofile}`
    const audioPath = `${orderPath}/${audiofile}`
    const ffCmd = ffmpeg();
    ffCmd.addInput(slidelist).inputOptions(['-f concat'])

    ffCmd.addInput(logoPath)
    if(animated(fs.readFileSync(logoPath))) // check if logo is animated gif
      ffCmd.inputOptions('-ignore_loop 0')
    ffCmd.addInput(audioPath)

    if(wavevizcolor){
      ffCmd.complexFilter(`[2:a]showwaves=s=960x540:mode=${wavevizmode}:colors=${wavevizcolor}[wv];[0:v][1:v]overlay=0:0[v1]; [wv][v1]overlay=0:0[vf]`)
    }else{
      ffCmd.complexFilter('[0:v][1:v]overlay=0:0[vf]')
    }

    ffCmd.outputOptions(
      '-map', '[vf]',
      '-map', '2:a',
      '-c:a', 'aac',
      '-b:a', '384k',
      '-profile:a', 'aac_low',
      '-shortest',
      '-movflags',
      'faststart'
    );

    // finalize
    ffCmd.on('start', function(commandLine) {
      // console.log('Command: ' + commandLine);
      console.log(`Starting 'combineFinalSlideShow'...`);
    })
    .on('progress', function(progress) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`Progress: ${progress.timemark}`);
    })
    .on('error', function(err) {
      console.log('Error: ' + err.message);
    })
    .on('end', function() {
      console.log('Processing slideshow finished!');
      return callback(null, 3)
    })
    ffCmd.save(outPath);
  },

  createStaticShow: (orderPath, resizedPath, audiofile, logoFile, staticFile, wavevizcolor, wavevizmode, outPath) => {
    console.log('Creating Static Show...')
    const logoPath = `${orderPath}/resized-${logoFile}`
    const staticPath = `${orderPath}/${staticFile}`
    async.series([
      function(callback){
        module.exports.resizeImage(`${orderPath}/${logoFile}`, `${orderPath}/resized-${logoFile}`, orderPath, callback)
      },
      function(callback) {
        const outPath = `${resizedPath}/${C.staticFilename}`
        module.exports.resizeImage(staticPath, outPath, orderPath, callback)
      },
      function(callback) {
        module.exports.finalizeStaticShow(orderPath, resizedPath, audiofile, logoFile, staticFile, wavevizcolor, wavevizmode, outPath, callback)
      }
    ],
    function(err, results) {
      console.log(results)
    });
  },

  finalizeStaticShow: (orderPath, resizedPath, audiofile, logoFile, staticFile, wavevizcolor, wavevizmode, outPath, callback) => {
    const logoPath = `${orderPath}/resized-${logoFile}`
    const audioPath = `${orderPath}/${audiofile}`
    let staticResizedPath = `${resizedPath}/${C.staticFilename}`
    let wavevisFilter = ''
    let videoMap = ''

    const ffCmd = ffmpeg();

    if(logoFile){
      ffCmd.addInput(`${logoPath}`)
      if(animated(fs.readFileSync(`${logoPath}`))) // check if logo is animated gif
        ffCmd.inputOptions('-ignore_loop 0')
    }

    ffCmd.addInput(`${staticResizedPath}`).loop()
    ffCmd.addInput(audioPath)

    let audioSpecifier = (logoFile ? '2' : '1');

    if(logoFile){
      if(wavevizcolor){
        wavevisFilter = `[${audioSpecifier}:a]showwaves=s=960x540:mode=${wavevizmode}:colors=${wavevizcolor}[wv];`
        ffCmd.complexFilter([ wavevisFilter, '[1:v][0:v]overlay=0:0[v1];', '[wv][v1]overlay=0:0[vf]' ].join(''))
      }else{
        ffCmd.complexFilter('[1:v][0:v]overlay=0:0[vf]')
      }
      videoMap = '[vf]'
    }else{
      if(wavevizcolor){
        wavevisFilter = `[${audioSpecifier}:a]showwaves=s=960x540:mode=${wavevizmode}:colors=${wavevizcolor}[wv];`
        ffCmd.complexFilter([ wavevisFilter, '[wv][0:v]overlay=0:0[vf]' ].join(''))
        videoMap = '[vf]'
      }else{
        videoMap = '0:v'
      }
    }

    ffCmd.outputOptions(
      '-ignore_loop', '0',
      '-map', videoMap,
      '-map', `${audioSpecifier}:a`,
      '-c:a', 'aac',
      '-b:a', '384k',
      '-profile:a', 'aac_low',
      '-shortest',
      '-r', '24',
      '-movflags',
      'faststart'
    );

    // finalize
    ffCmd.on('start', function(commandLine) {
      // console.log('Command: ' + commandLine);
      console.log(`Starting 'finalizeStaticShow'...`);
    })
    .on('progress', function(progress) {
      process.stdout.clearLine();
      process.stdout.cursorTo(0);
      process.stdout.write(`Progress: ${progress.timemark}`);
    })
    .on('error', function(err) {
      console.log('Error: ' + err.message);
    })
    .on('end', function() {
      console.log('Processing slideshow finished!');
      return callback(null, 3)
    })
    ffCmd.save(outPath);
  }

};
