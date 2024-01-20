import React from 'react'
import ReactDOM from 'react-dom/client'
import '@styles/main.scss'
import { Settings } from '@components/Settings'

const root = ReactDOM.createRoot(<HTMLElement>document.querySelector('#root'))
root.render(React.createElement(Settings))
