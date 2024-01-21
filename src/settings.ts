import React from 'react'
import ReactDOM from 'react-dom/client'
import '@styles/main.scss'
import { Settings } from '@components/Settings'
import { PluginGate } from 'wrapper/PluginGate'

const root = ReactDOM.createRoot(<HTMLElement>document.querySelector('#root'))
root.render(
  React.createElement(PluginGate, null, React.createElement(Settings)),
)
