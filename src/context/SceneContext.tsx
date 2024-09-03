import { Scene } from '@obr'
import OBR from '@owlbear-rodeo/sdk'
import React, { createContext, useEffect, useState } from 'react'

interface SceneContextProps {
  sceneMetadata: Scene.SceneMetadata
  settings: Scene.SettingsMetadata
  setSettings: (settings: Scene.SettingsMetadata) => void
  friendsListOrder: Scene.ListOrderMetadata
  setFriendsListOrder: (listOrder: Scene.ListOrderMetadata) => void
  foesListOrder: Scene.ListOrderMetadata
  setFoesListOrder: (listOrder: Scene.ListOrderMetadata) => void
  roundCount: number
  setRoundCount: (roundCount: number) => Promise<void>
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
  const [friendsListOrder, setLocalFriendsListOrder] =
    useState<Scene.ListOrderMetadata>()
  const [foesListOrder, setLocalFoesListOrder] =
    useState<Scene.ListOrderMetadata>()
  const [roundCount, setLocalRoundCount] = useState<number>(0);

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
      setLocalFriendsListOrder(sceneMetadata.listOrders.friends)
      setLocalFoesListOrder(sceneMetadata.listOrders.foes)
      setLocalRoundCount(sceneMetadata.roundCount)
    }
  }, [sceneMetadata])

  const setSettings = (settings: Scene.SettingsMetadata) => {
    Scene.updateSettingsMetadata(settings)
  }

  const setFriendsListOrder = (listOrder: Scene.ListOrderMetadata) => {
    Scene.updateFriendsListOrderMetadata(listOrder)
  }

  const setFoesListOrder = (listOrder: Scene.ListOrderMetadata) => {
    Scene.updateFoesListOrderMetadata(listOrder)
  }

  const setRoundCount = async (roundCount: number) => {
    await Scene.updateRoundCount(roundCount)
  }

  if (sceneMetadata) {
    const contextValue: SceneContextProps = {
      sceneMetadata,
      settings: settings as Scene.SettingsMetadata,
      setSettings,
      friendsListOrder: friendsListOrder as Scene.ListOrderMetadata,
      setFriendsListOrder,
      foesListOrder: foesListOrder as Scene.ListOrderMetadata,
      setFoesListOrder,
      roundCount,
      setRoundCount 
    }
    return (
      <SceneContext.Provider value={contextValue}>
        {children}
      </SceneContext.Provider>
    )
  } else return <>{loadingChildren}</>
}

export { SceneProvider, SceneContext }
