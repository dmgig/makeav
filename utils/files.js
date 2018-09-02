const fs = require('fs');
const path = require('path');
const IMAGETYPES = [ '.png', '.jpg', '.jpeg', '.gif' ];

module.exports = {

  getCurrentDirectoryBase: () => {
    return path.basename(process.cwd());
  },

  directoryExists: (filePath) => {
    try {
      return fs.statSync(filePath).isDirectory();
    } catch (err) {
      return false;
    }
  },

  getListOfImageFiles: (dir) => {
    return new Promise((resolve, reject) => {
      return fs.readdir(dir, function(err, items) {
        const files = items || [], imgArr = []
        for (var i=0; i<files.length; i++) {
          let ext = path.extname(items[i]).toLowerCase();
          if(IMAGETYPES.includes(ext)) imgArr.push(items[i]);
        }
        resolve(imgArr)
      });
    })
  },

};
