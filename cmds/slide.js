const files = require('../utils/files')
const error = require('../utils/error')
const Configstore = require('configstore')
const conf = new Configstore('makeav')

module.exports = async (args) => {

  try {
    files.getListOfImageFiles(conf.get('working_dir'));
  } catch (err) {
    error(err)
  }
}
