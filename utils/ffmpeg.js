const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');

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

  makeSlideShow: (orderPath, resizedPath, duration, imageFiles) => {
    console.log('makeSlideshow')
    const slideshow = `${resizedPath}/makeav-slideshow.mp4`
    return new Promise((resolve, reject) => {
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
        console.log('Command: ' + commandLine);
      })
      .on('error', function(err) {
        console.log('Error: ' + err.message);
      })
      .on('end', function() {
        console.log('Processing finished!');
      })
      ffCmd.save(slideshow);
      resolve(true)
    })
  },

  makeSlideShowList: (orderPath) => {
    console.log('makeSlideshowList')
    const slidelist = `${orderPath}/makeav-slidelist.txt`
    return new Promise((resolve, reject) => {
      let string = ''
      for(i=0; i<500; i++){
        string = `${string}file 'makeav-slideshow.mp4'\n`
      }
      fs.writeFile(slidelist, string, 'utf8', (err) => {
        if (err) throw err;
        resolve(true)
      });
    })
  },

  combineFinalSlideShow: (orderPath, audiofile, outname, waveviz) => {
    console.log('combineFinalSlideshow')
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

};
