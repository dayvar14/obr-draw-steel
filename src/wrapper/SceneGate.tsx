import OBR from '@owlbear-rodeo/sdk'
import React, { useEffect, useState } from 'react'

export function SceneGate({
  children,
  loadingChildren,
  onSceneReady,
  onSceneNotReady,
  loadIfNotReady,
}: {
  children?: React.ReactNode
  loadingChildren?: React.ReactNode
  onSceneReady?: () => void | Promise<void>
  onSceneNotReady?: () => void | Promise<void>
  loadIfNotReady?: boolean
}) {
  const [sceneReady, setSceneReady] = useState(false)

  useEffect(() => {
    OBR.scene.isReady().then(async ready => {
      if (ready && onSceneReady && !sceneReady) {
        const result = onSceneReady()
        if (result instanceof Promise) {
          await result
        }
      } else if (!ready && onSceneNotReady) {
        const result = onSceneNotReady()
        if (result instanceof Promise) {
          await result
        }
      }
      setSceneReady(ready)
    })

    OBR.scene.onReadyChange(async ready => {
      if (ready && onSceneReady && !sceneReady) {
        const result = onSceneReady()
        if (result instanceof Promise) {
          await result
        }
      } else if (!ready && onSceneNotReady) {
        const result = onSceneNotReady()
        if (result instanceof Promise) {
          await result
        }
      }
      setSceneReady(ready)
    })
  }, [])

  if (loadIfNotReady) {
    return <>{children}</>
  }

  if (sceneReady) {
    return <>{children}</>
  } else {
    return <>{loadingChildren}</>
  }
}
