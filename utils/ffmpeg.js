const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const async = require("async");
const path = require("path");
const C = require("../constants");

module.exports = {

  resizeImage: (i, inPath, resizedir, outname, callback) => {
    let id, outPath
    if(outname){
      outPath = `${resizedir}/${outname}`
    }else{
      id = i + 1;
      outPath = `${resizedir}/${C.imgPrefix}-${id.toString().padStart(3, '0')}.png`
    }
    ffmpeg(inPath)
      .videoFilter("format=rgba")
      .videoFilter('scale=iw*min(960/iw\\,480/ih):ih*min(960/iw\\,480/ih)')
      .videoFilter("pad=960:540:(960-iw)/2:(480-ih)/2:color=00000000")
      .on('start', function(commandLine) {
        console.log('Command: ' + commandLine);
      })
      .on('error', function(err) {
        console.log('Error: ' + err.message);
      })
      .on('end', function() {
        callback(null, true)
        console.log('Resizing image finished!');
      })
      .save(outPath)
  },

  createSlideShow: (orderPath, resizedPath, audiofile, duration, imageFiles, logofile, waveviz, outPath) => {
    async.series([
      function(callback) {
        console.log(1)
        module.exports.makeSlideShow(orderPath, resizedPath, duration, imageFiles, callback)
      },
      function(callback) {
        console.log(2)
        module.exports.makeSlideShowList(orderPath, callback)
      },
      function(callback) {
        console.log(3)
        module.exports.combineFinalSlideShow(orderPath, resizedPath, audiofile, duration, imageFiles, logofile, waveviz, outPath, callback)
      }
    ],
    // optional callback
    function(err, results) {
      console.log(results)
      // results is now equal to ['one', 'two']
    });
  },

  makeSlideShow: (orderPath, resizedPath, duration, imageFiles, callback) => {
    console.log('makeSlideshow')
    const slideshow = `${resizedPath}/${C.slideshowFilename}.mp4`
    const ffCmd = ffmpeg();
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
    })
    .on('progress', function(progress) {
      console.log(`Sildshow: ${progress.timemark}`);
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

  makeSlideShowList: (orderPath, callback) => {
    console.log('makeSlideshowList')
    const slidelist = `${orderPath}/${C.slidelistTxt}`
    let string = ''
    for(i=0; i<500; i++){
      string = `${string}file 'resized/${C.slideshowFilename}.mp4'\n`
    }
    let options = { 'encoding': 'utf8' }
    fs.writeFile(slidelist, string, options, (err) => {
      if (err) throw err;
      console.log('slidelist written')
      return callback(null, 2)
    });
  },

  combineFinalSlideShow: (orderPath, resizedPath, audiofile, duration, imageFiles, logofile, waveviz, outPath, callback) => {
    console.log('combineFinalSlideshow')
    const slidelist = `${orderPath}/${C.slidelistTxt}`
    const slideshow = `${resizedPath}/${C.slideshowFilename}.mp4`
    const logoPath = `${resizedPath}/${logofile}`
    const audioPath = `${orderPath}/${audiofile}`
    const ffCmd = ffmpeg();
    ffCmd.addInput(slidelist).inputOptions(['-f concat'])
    ffCmd.addInput(logoPath)
    ffCmd.addInput(audioPath)

    if(waveviz){
      waveviz = waveviz.split(',')
      ffCmd.complexFilter(`[2:a]showwaves=s=960x540:mode=${waveviz[1]}:colors=${waveviz[0]}[wv];[0:v][1:v]overlay=0:0[v1]; [wv][v1]overlay=0:0[vf]`)
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
    })
    .on('progress', function(progress) {
      console.log(`Video: ${progress.timemark}`);
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

  createStaticShow: (orderPath, resizedPath, audiofile, logoFile, staticFile, waveviz, outPath) => {
    console.log('createStaticShow')
    const logoPath = `${orderPath}/${logoFile}`
    const staticPath = `${orderPath}/${staticFile}`
    async.series([
      function(callback) {
        console.log(1)
        module.exports.resizeImage(0, logoPath, resizedPath, C.logoFilename, callback)
      },
      function(callback) {
        console.log(2)
        module.exports.resizeImage(0, staticPath, resizedPath, C.staticFilename, callback)
      },
      function(callback) {
        console.log(3)
        module.exports.finalizeStaticShow(orderPath, resizedPath, audiofile, C.logoFilename, C.staticFilename, waveviz, outPath, callback)
      }
    ],
    function(err, results) {
      console.log(results)
    });
  },

  finalizeStaticShow: (orderPath, resizedPath, audiofile, logoFile, staticFile, waveviz, outPath, callback) => {
    const logoResizedPath = `${resizedPath}/${C.logoFilename}`
    const staticResizedPath = `${resizedPath}/${C.staticFilename}`
    const audioPath = `${orderPath}/${audiofile}`

    const ffCmd = ffmpeg();

    ffCmd.addInput(`${logoResizedPath}`).loop()
    ffCmd.addInput(`${staticResizedPath}`).loop()
    ffCmd.addInput(audioPath)

    if(waveviz){
      waveviz = waveviz.split(',')
      ffCmd.complexFilter(`[2:a]showwaves=s=960x540:mode=${waveviz[1]}:colors=${waveviz[0]}[wv];[0:v][1:v]overlay=0:0[v1]; [wv][v1]overlay=0:0[vf]`)
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
      '-r', '24',
      '-movflags',
      'faststart'
    );

    // finalize
    ffCmd.on('start', function(commandLine) {
      console.log('Command: ' + commandLine);
    })
    .on('progress', function(progress) {
      console.log(`Video: ${progress.timemark}`);
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
