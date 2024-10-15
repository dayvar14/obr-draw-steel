import React from 'react'
import ReactDOM from 'react-dom/client'
import { ContextMenu } from '@obr'
import '@styles/main.scss'
import DrawSteel from '@components/DrawSteel'
import { PluginGate } from 'wrapper/PluginGate'
import OBR from '@owlbear-rodeo/sdk'
import { upgradeMetadata } from 'util/metadataUpgrader'

ContextMenu.setupContextMenu()

OBR.onReady(() => {
  OBR.scene.onReadyChange(() => {
    upgradeMetadata()
  })
})

const root = ReactDOM.createRoot(<HTMLElement>document.querySelector('#root'))
root.render(
  React.createElement(PluginGate, null, React.createElement(DrawSteel)),
)
