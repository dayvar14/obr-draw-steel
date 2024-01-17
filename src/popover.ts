import React from 'react'
import ReactDOM from 'react-dom/client'
import '@styles/main.scss'
import { TokenOptions } from '@components/TokenOptions'

const root = ReactDOM.createRoot(<HTMLElement>document.querySelector('#root'))
root.render(React.createElement(TokenOptions))
