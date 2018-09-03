const inquirer  = require('../utils/config');
const error = require('../utils/error')
const Configstore = require('configstore')
const conf = new Configstore('makeav')
const fs = require('fs')

module.exports = async (args) => {
  try {
    const run = async () => {
      const configVals = await inquirer.mainConfig();
      const workingDir = `${configVals.workingDir}`;
      const workingDirPath = `${process.cwd()}/${configVals.workingDir}`;
      const outputDir = `${configVals.outputDir}`;
      const outputDirPath = `${process.cwd()}/${configVals.outputDir}`;
      conf.set('workingDir', workingDir)
      conf.set('workingDirPath', workingDirPath)
      conf.set('outputDir', outputDir)
      conf.set('outputDirPath', outputDirPath)
      if(!fs.existsSync(workingDirPath))
        fs.mkdirSync(workingDirPath)
      if(!fs.existsSync(outputDirPath))
        fs.mkdirSync(outputDirPath)
    }
    run();
  } catch (err) {
    error(err)
  }
}
