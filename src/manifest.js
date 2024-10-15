import fs from 'fs'
import { APP_HEIGHT, APP_WIDTH, APP_VERSION } from './config.js'

const argument = process.argv[2]

const environment = process.env.OBR_DEPLOYMENT_ENVIRONMENT

let applicationName = 'Draw Steel Initiative Tracker (Test)'

switch (environment) {
  case 'production':
    console.log('Running in a production environment.')
    applicationName = 'Draw Steel Initiative Tracker'
    break

  case 'development':
    console.log('Running in development environment.')
    applicationName = 'Draw Steel Initiative Tracker (Dev)'
    break
}

const manifest = {
  name: applicationName,
  version: APP_VERSION,
  author: 'Daniel Ayvar',
  homepage_url: 'https://github.com/dayvar14/obr-draw-steel',
  manifest_version: 1,
  description:
    'An unofficial Draw Steel TTRPG initiative tracker for Owlbear Rodeo.',
  icon: '/icons/sword_clash.png',
  action: {
    title: 'Draw Steel Initiative Tracker',
    icon: '/icons/sword_clash.svg',
    popover: '/',
    height: APP_HEIGHT,
    width: APP_WIDTH,
  },
}

// Create dist folder if it doesn't exist
const folderPath = './dist'

// Use fs.mkdir to create the folder
fs.mkdir(folderPath, { recursive: true }, err => {
  if (err) {
    console.error('Error creating folder:', err)
  }
})

console.log(`Writing manifest.json to ${argument}`)
fs.writeFileSync(argument, JSON.stringify(manifest, null, 2))
