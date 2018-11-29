# MakeAV _1.0.0alpha_

## Slideshow creator with ffmpeg

#### Dependencies

Must have ffmpeg installed

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
```

Initializing will create your working directory for your working files, and an output directory for the video output.

Add a new directory to the working directory containing your images, logo, and audio files.

- Images can be of any size and format, will be resized to fit the video frame
- Logo should be 960x640 image, png or gif (animated gifs work as well)
- Audio can be of any format
- slideshow files must be in a subfolder named `slideshow`, must be png or jpeg

This directory's name is your order id.

```bash
# help
makeav help

#static show
makeav static -o=test -a=output.wav -l=logo.png -s=e.png -r 1

#slide show
makeav slide -o=test -a=output.wav -l=logo.png -r 1
```

Videos will appear in the output folder.
