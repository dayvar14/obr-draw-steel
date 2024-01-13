import OBR from '@owlbear-rodeo/sdk'
import React, { useEffect, useState } from 'react'

export const SceneGate = ({
  children,
  loadingChildren,
}: {
  children?: React.ReactNode
  loadingChildren?: React.ReactNode
}) => {
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    OBR.scene.isReady().then(ready => {
      setSceneReady(ready)
    })
  }, [])

  useEffect(() => {
    OBR.scene.onReadyChange(ready => {
      setSceneReady(ready)
    })
  }, [])

  if (sceneReady) {
    return <>{children}</>
  } else {
    return <>{loadingChildren}</>
  }
}

export default SceneGate
