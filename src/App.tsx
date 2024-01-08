import { useEffect, useState } from 'react'

import OBR from '@owlbear-rodeo/sdk'
import DrawSteel from './components/drawsteel/drawSteel'

export function App() {
  const [isOBRReady, setOBRReady] = useState(false)
  const [isSceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    OBR.onReady(() => {
      setOBRReady(true)
      OBR.scene.onReadyChange(ready => {
        setSceneReady(ready)
      })
    })
  })

  if (isOBRReady && isSceneReady) {
    return <DrawSteel />
  } else {
    // Show a basic header when the scene isn't ready
    return <></>
  }
}
