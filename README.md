# KinoTube
A **work-in-progress** script for CyTube channels. It was written from the ground up with a focus on performance and less bloat, meant to be a lightweight replacement for BillTube while still looking familiar.

This script modifies the page layout and adds some features including custom themes, chat commands, Tenor search support, emote favoriting, and more.

[Click here to see the changelog.](./CHANGELOG.md)

## Usage
The script must be built with webpack, see [Building](#building) below.  
Room usage info will come soon.

## Building
This project requires NodeJS and NPM to be installed. Just clone, run `npm install`, then `npm run build`.
```sh
git clone https://github.com/checkthesedubs/kinotube.git
cd kinotube
npm install
npm run build
```
The script will be placed in `build/kinotube.js`.

## Issues/Oddities
- Mobile devices currently have very minimal support. They're still usable, though probably best in landscape mode for now.
- The name is probably temporary and could change (including the name of this repo). It used to be called Project Nexus in early development, so internally, the name `Nexus` is still used.
- "Plugins" do exist in this project, but the way they're written still kinda makes them internal.
- The playlist area is currently unthemed and untouched, as I think it's fairly low priority at the moment.