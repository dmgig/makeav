# MakeAV _1.0.0alpha_

## Slideshow creator with ffmpeg

#### Install

```bash
git clone https://github.com/dmgig/makeav.git makeav
cd makeav
npm install
npm link
```

#### Use

Create a folder where you'll want to save your working files and your output videos.

```bash
makeav init
makeav help
```

Add a new folder to the working directory containing your images, logo, and audio files.

This directory's name is your order id.

```bash
#static show
makeav static -o=test -a=output.wav -l=logo.png -s=e.png

#slide show
makeav slide -o=test -a=output.wav -l=logo.png
```

Videos will appear in the output folder.
