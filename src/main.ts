import ReactDOM from 'react-dom/client'
import React from 'react'
import './main.sass'
import { setupContextMenu } from './obr/contextmenu'
import { App } from './App'

setupContextMenu()

const root = ReactDOM.createRoot(<HTMLElement>document.querySelector('#root'))
root.render(React.createElement(App))
