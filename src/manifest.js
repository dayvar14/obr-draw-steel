import fs from 'fs'
import { APP_HEIGHT, APP_WIDTH } from './config.js'

const argument = process.argv[2]

const environment = process.env.OBR_DEPLOYMENT_ENVIRONMENT

let applicationName = 'Draw Steel! (Test)'

switch (environment) {
  case 'production':
    console.log('Running in a production environment.')
    applicationName = 'Draw Steel!'
    break

  case 'development':
    console.log('Running in development environment.')
    applicationName = 'Draw Steel! (Dev)'
    break
}

const manifest = {
  name: applicationName,
  version: '0.4.0',
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
