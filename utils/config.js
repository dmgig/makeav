const inquirer = require('inquirer');

module.exports = {

  mainConfig: () => {
    const questions = [
      {
        name: 'working_dir',
        type: 'input',
        message: 'Enter working directory location (relative to current path):',
        default: 'working',
        validate: function( value ) {
          if (value.length) {
            return true;
          } else {
            return 'Please enter working directory name.';
          }
        }
      },
      {
        name: 'output_dir',
        type: 'input',
        message: 'Enter output directory location (relative to current path):',
        default: 'output',
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
