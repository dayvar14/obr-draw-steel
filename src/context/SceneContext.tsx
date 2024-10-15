import { Scene } from '@obr'
import OBR from '@owlbear-rodeo/sdk'
import React, { createContext, useEffect, useState } from 'react'

interface SceneContextProps {
  sceneMetadata: Scene.SceneMetadata
  settings: Scene.SettingsMetadata
  setSettings: (settings: Scene.SettingsMetadata) => void
}

const SceneContext = createContext<SceneContextProps | undefined>(undefined)

const SceneProvider = ({
  children,
  loadingChildren,
}: {
  children?: React.ReactNode
  loadingChildren?: React.ReactNode
}) => {
  const [sceneReady, setSceneReady] = useState(false)
  const [sceneMetadata, setSceneMetadata] = useState<Scene.SceneMetadata>()
  const [settings, setLocalSettings] = useState<Scene.SettingsMetadata>()

  useEffect(() => {
    OBR.scene.isReady().then(ready => {
      setSceneReady(ready)
    })

    OBR.scene.onReadyChange(ready => {
      setSceneReady(ready)
    })
  }, [])

  useEffect(() => {
    const fetchSceneMetadata = async () => {
      const sceneMetadata = await Scene.getSceneMetadata()
      setSceneMetadata(sceneMetadata)
    }

    if (sceneReady) {
      Scene.onSceneMetadataChange(metadata => {
        setSceneMetadata(metadata)
      })

      fetchSceneMetadata()
    }
  }, [sceneReady])

  useEffect(() => {
    if (sceneMetadata) {
      setLocalSettings(sceneMetadata.settings)
    }
  }, [sceneMetadata])

  const setSettings = (settings: Scene.SettingsMetadata) => {
    Scene.updateSettingsMetadata(settings)
  }

  useEffect(() => {
    if (sceneMetadata) {
      setLocalSettings(sceneMetadata.settings)
    }
  }, [sceneMetadata])

  if (sceneMetadata) {
    const contextValue: SceneContextProps = {
      sceneMetadata,
      settings: settings as Scene.SettingsMetadata,
      setSettings,
    }
    return (
      <SceneContext.Provider value={contextValue}>
        {children}
      </SceneContext.Provider>
    )
  } else return <>{loadingChildren}</>
}

export { SceneProvider, SceneContext }
