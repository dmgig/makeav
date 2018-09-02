const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const async = require("async");

module.exports = {

  resizeImage: (i, inPath, resizedir) => {
    const id = i + 1;
    const outPath = `${resizedir}/makeav-img-${id.toString().padStart(3, '0')}.png`
    return new Promise((resolve, reject) => {
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
          console.log('Processing finished!');
        })
        .save(outPath)
      resolve(true)
    })
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
    const slideshow = `${resizedPath}/makeav-slideshow.mp4`
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
    const slidelist = `${orderPath}/makeav-slidelist.txt`
    let string = ''
    for(i=0; i<500; i++){
      string = `${string}file 'resized/makeav-slideshow.mp4'\n`
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
    const slidelist = `${orderPath}/makeav-slidelist.txt`
    const slideshow = `${resizedPath}/makeav-slideshow.mp4`
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
