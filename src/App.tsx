import { useEffect, useState } from 'react'

import OBR from '@owlbear-rodeo/sdk'
import DrawSteel from './components/drawsteel/drawSteel'
import { ThemeState, getThemeState, setThemeStateListener } from './obr/theme.ts'

export function App() {
  const [isOBRReady, setOBRReady] = useState(false)
  const [isSceneReady, setSceneReady] = useState(false)
  const [themeState, setThemeState] = useState<undefined | ThemeState>(
    undefined,
  )

  useEffect(() => {
    OBR.onReady(() => {
      setOBRReady(true)
    })

    setThemeStateListener(theme => {
      setThemeState(theme)
    })

    getThemeState().then(setThemeState)
  }, [])

  useEffect(() => {
    if (isOBRReady) {
      OBR.scene.onReadyChange(ready => {
        setSceneReady(ready)
      })
    }

  }, [isOBRReady])

  if (isOBRReady && isSceneReady && themeState) {
    return <DrawSteel themeState={themeState} />
  } else {
    return <></>
  }
}
