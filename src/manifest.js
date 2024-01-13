import fs from 'fs'
import { APP_HEIGHT, APP_WIDTH } from './config.js'

const argument = process.argv[2]

const manifest = {
  name: 'Draw Steel!',
  version: '0.3.0',
  author: 'Daniel Ayvar',
  homepage_url: 'https://github.com/dayvar14/obr-draw-steel',
  manifest_version: 1,
  description: 'An unofficial MCDM RPG initiative tracker for Owlbear Rodeo.',
  icon: '/icons/sword_clash.png',
  action: {
    title: 'Draw Steel!',
    icon: '/icons/sword_clash.svg',
    popover: '/',
    height: APP_HEIGHT,
    width: APP_WIDTH,
  },
}

console.log(`Writing manifest.json to ${argument}`)
fs.writeFileSync(argument, JSON.stringify(manifest, null, 2))
