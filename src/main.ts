import React from 'react'
import ReactDOM from 'react-dom/client'
import { ContextMenu } from '@obr'
import '@styles/main.scss'
import DrawSteel from '@components/DrawSteel'

ContextMenu.setupContextMenu()

const root = ReactDOM.createRoot(<HTMLElement>document.querySelector('#root'))
root.render(React.createElement(DrawSteel))
