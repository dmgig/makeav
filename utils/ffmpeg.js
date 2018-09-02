const ffmpeg = require('fluent-ffmpeg');

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

};
