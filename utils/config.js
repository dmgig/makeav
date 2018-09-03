const inquirer = require('inquirer');
const C = require('../constants')

module.exports = {

  mainConfig: () => {
    const questions = [
      {
        name: 'workingDir',
        type: 'input',
        message: 'Enter working directory location (relative to current path):',
        default: C.ordersDirname,
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter working directory name.';
          }
        }
      },
      {
        name: 'outputDir',
        type: 'input',
        message: 'Enter output directory location (relative to current path):',
        default: C.outputDirname,
        validate: function(value) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter output directory name.';
          }
        }
      }
    ];
    return inquirer.prompt(questions);
  },
}
