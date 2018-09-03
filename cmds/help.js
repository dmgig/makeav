const menus = {
  main: `
    makeav [command] <options>

    init ............... create working, output directories
    resize ............. resize images
    slide .............. create a slide show
    static ............. create a show with a static image
    version ............ show package version
    help ............... show help menu for a command`,

  init: `
    makeav init`,

  resize: `
    makeav resize`,

  slide: `
    makeav slide <options>

    --orderid, -o ....... (string) order id, directory name [required]
    --audiofile, -a ..... (string) audio filename [required]
    --duration, -d ...... (int) slide duration, defaults to 8
    --waveviz, -w ....... (web color) wave visual, if false will not appear
    --logo, -l .......... (string) logo image file
    --outname, -o ....... (string) output name`,

  static: `
    makeav slide <options>

    --orderid, -o ....... (string) order id, directory name [required]
    --audiofile, -a ..... (string) audio filename [required]
    --waveviz, -w ....... (web color) wave visual, if false will not appear
    --logo, -l .......... (string) logo image file
    --static, -s ....... (string) main image file
    --outname, -o ....... (string) output name`,
}

module.exports = (args) => {
  const subCmd = args._[0] === 'help'
    ? args._[1]
    : args._[0]

  console.log(menus[subCmd] || menus.main)
}
