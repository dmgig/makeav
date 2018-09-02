const inquirer  = require('../utils/config');
const error = require('../utils/error')
const Configstore = require('configstore')
const conf = new Configstore('makeav')

module.exports = async (args) => {
  try {
    const run = async () => {
      const configVals = await inquirer.mainConfig();
      conf.set('working_dir', `./${configVals.working_dir}`)
      conf.set('output_dir', `./${configVals.output_dir}`)
    }
    run();
  } catch (err) {
    error(err)
  }
}