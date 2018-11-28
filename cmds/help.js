const menus = {
  main: `
    makeav [command] <options>

    init ............... create working, output directories
    config ............... show current config values
    resize ............. resize images
    slide .............. create a slide show
    static ............. create a show with a static image
    version ............ show package version
    help ............... show help menu for a command`,

  init: `
    makeav init`,

  init: `
    makeav init`,

  resize: `
    makeav resize`,

  slide: `
    makeav slide <options>

    --orderid, -o ....... (string) order id, directory name [required]
    --audiofile, -a ..... (string) audio filename [required]
    --resize, -r ........ (bool) if set to true, will resize images to fit the slides and convert them to pngs, which is required if they are not all 960x640 pngs
    --duration, -d ...... (int) slide duration, defaults to 8
    --wavevizcolor ...... (web color) wave visual, if false, wave will not appear
    --wavevizmode ....... (lin|log|sqrt|cbrt) wave visual mode, defaults to 'lin'
    --logo, -l .......... (string) logo image file
    --outname, -o ....... (string) output name, defaults to orderid-date`,

  static: `
    makeav slide <options>

    --orderid, -o ....... (string) order id, directory name [required]
    --audiofile, -a ..... (string) audio filename [required]
    --resize, -r ........ (bool) if set to true, will resize images to fit the slides and convert them to pngs, which is required if they are not all 960x640 pngs
    --wavevizcolor ...... (web color) wave visual, if false, wave will not appear
    --wavevizmode ....... (lin|log|sqrt|cbrt) wave visual mode, defaults to 'lin'
    --logo, -l .......... (string) logo image file
    --static, -s ........ (string) main image file
    --outname, -o ....... (string) output name, defaults to orderid-date`,
}

module.exports = (args) => {
  const subCmd = args._[0] === 'help'
    ? args._[1]
    : args._[0]

  console.log(menus[subCmd] || menus.main)
}
