const menus = {
  main: `
    makeav [command] <options>

    slide .............. create a slide show
    static ............. create a show with a static image
    version ............ show package version
    help ............... show help menu for a command`,

  slide: `
    makeav slide <options>

    --location, -l ..... the location to use`,

  static: `
    makeav slide <options>

    --location, -l ..... the location to use`,
}

module.exports = (args) => {
  const subCmd = args._[0] === 'help'
    ? args._[1]
    : args._[0]

  console.log(menus[subCmd] || menus.main)
}
