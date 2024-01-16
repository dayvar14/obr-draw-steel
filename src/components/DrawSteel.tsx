import InitiativeList from './InitiativeList/InitiativeList.tsx'
import ThemeWrapper from '../wrapper/ThemeWrapper.tsx'
import { Header } from './Header/Header.tsx'
import { PluginGate } from '../wrapper/PluginGate.tsx'
import { PermissionProvider } from '../context/PermissionContext.tsx'
import { PartyProvider } from '../context/PartyContext.tsx'
import { PlayerProvider } from '../context/PlayerContext.tsx'
import { TokenProvider } from '../context/TokenContext.tsx'
import { useEffect, useState } from 'react'
import { APP_HEIGHT } from 'config.js'
import { Action } from 'obr/action.ts'
import SceneGate from 'wrapper/SceneGate.tsx'
import OBR from '@owlbear-rodeo/sdk'

const DrawSteel = () => {
  const [listHeight, setListHeight] = useState(0)
  const [isSceneReady, setIsSceneReady] = useState(false)

  /* might want to refactor this in the future */
  useEffect(() => {
    OBR.onReady(() => {
      OBR.scene.onReadyChange((isReady: boolean) => {
        setIsSceneReady(isReady)
      })
    })
  })

  const onListHeightChange = (listHeight: number) => {
    setListHeight(listHeight)
  }

  /* might want to refactor this in the future */
  useEffect(() => {
    const setNewAppHeight = async () => {
      const headerHeight = 68
      const hrHeight = 1
      const defaultListHeight = APP_HEIGHT - (headerHeight + hrHeight)

      /* needed because owl-bear-rodeo height clips the bottom of the list */
      /* needed to match the manifest app height of 300px */
      const padding = 32

      const newHeight = Math.max(
        headerHeight + hrHeight + listHeight + padding,
        defaultListHeight + padding,
      )
      await Action.setHeight(newHeight)
    }
    setNewAppHeight()
  }, [listHeight])

  /* might want to refactor this in the future */
  useEffect(() => {
    const setNewAppHeight = async () => {
      if (!isSceneReady) {
        await Action.setHeight(APP_HEIGHT)
      }
    }
    setNewAppHeight()
  }, [isSceneReady])

  return (
    <PluginGate>
      <ThemeWrapper className={'app-container'}>
        <PlayerProvider>
          <Header isReady={isSceneReady} />
          <hr />
          <SceneGate
            loadingChildren={
              <div className={'no-scene'}>
                <p>Select a scene to start combat.</p>
              </div>
            }
          >
            <PartyProvider>
              <PermissionProvider>
                <TokenProvider>
                  <InitiativeList onListHeightChange={onListHeightChange} />
                </TokenProvider>
              </PermissionProvider>
            </PartyProvider>
          </SceneGate>
        </PlayerProvider>
      </ThemeWrapper>
    </PluginGate>
  )
}

export default DrawSteel
