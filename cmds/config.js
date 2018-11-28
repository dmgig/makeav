const inquirer  = require('../utils/config');
const error = require('../utils/error')
const Configstore = require('configstore')
const conf = new Configstore('makeav')
const fs = require('fs')

module.exports = async (args) => {
  try {
    const run = async () => {
      console.log(conf.all)
    }
    run();
  } catch (err) {
    error(err)
  }
}
