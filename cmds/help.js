const topCommon = `--orderid, -o ....... (string) order id, directory name [required]
    --audiofile, -a ..... (string) audio filename [required]
    --logo, -l .......... (string) logo image file`

const lowCommon = `--wavevizcolor ...... (web color) wave visual, if false, wave will not appear
    --wavevizmode ....... (point|line|p2p|line) wave visual mode, defaults to 'point'
    --outname, -o ....... (string) output name, defaults to orderid-date`

const menus = {
  main: `
    makeav [command] <options>

    init ............... create working, output directories
    config ............. show current config values
    resize ............. resize images
    slide .............. create a slide show
    static ............. create a show with a static image
    version ............ show package version
    help ............... show help menu for a command
`,

  init: `
    makeav init
`,

  init: `
    makeav init
`,

  resize: `
    makeav resize
`,

  slide: `
    makeav slide <options>

    ${topCommon}
    --resize, -r ........ (bool) if set to true, will resize images to fit the
                          slides and convert them to pngs, which is required if
                          they are not all 960x640 pngs
    --duration, -d ...... (int) slide duration, defaults to 8
    ${lowCommon}

    makeav slide -o=levine -a=output.wav -l=img.png -d=10 --wavevizcolor=#FFFFFF --wavevizmode=point -r=1
`,

  static: `
    makeav static <options>

    ${topCommon}
    --resize, -r ........ (bool) if set to true, will resize the static image
                          and convert them to pngs, which is required if it is
                          not a 960x640 png
    --static, -s ........ (string) main image file
    ${lowCommon}

    makeav static -o=order1 -a=audio.wav -logo=logo.png -static=image.png --wavevizmode=point --wavevizcolor=#FFFFFF
`
}

module.exports = (args) => {
  const subCmd = args._[0] === 'help'
    ? args._[1]
    : args._[0]

  console.log(menus[subCmd] || menus.main)
}
