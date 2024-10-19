import InitiativeList from './InitiativeList/InitiativeList.tsx'
import ThemeWrapper from '../wrapper/ThemeWrapper.tsx'
import { Header } from './Header/Header.tsx'
import { PermissionProvider } from '../context/PermissionContext.tsx'
import { PartyProvider } from '../context/PartyContext.tsx'
import { PlayerProvider } from '../context/PlayerContext.tsx'
import { useEffect, useRef, useState } from 'react'
import { APP_HEIGHT } from 'config.js'
import { Action } from 'obr/action.ts'
import { SettingsProvider } from 'context/SettingsContext.tsx'
import { GroupProvider } from 'context/GroupContext.tsx'
import { Popover, PopoverOptions } from './Popovers/Popover.tsx'
import { Footer } from './Footer.tsx'
import { TokenProvider } from 'context/TokenContext.tsx'
import { SceneGate } from 'wrapper/SceneGate.tsx'
import { upgradeMetadata } from 'util/metadata/upgrader.ts'

const DrawSteel = () => {
  const [listHeight, setListHeight] = useState(APP_HEIGHT)
  const [appHeight, setAppHeight] = useState<number>(APP_HEIGHT)
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false)
  const [popoverOptions, setPopoverOptions] = useState<PopoverOptions>()
  const baseRef = useRef<HTMLDivElement>(null)

  const onListHeightChange = (listHeight: number) => {
    setListHeight(listHeight)
  }

  /* might want to refactor this in the future */
  useEffect(() => {
    const setNewAppHeight = async () => {
      setAppHeight(getCurrentAppHeight(listHeight))
    }
    setNewAppHeight()
  }, [listHeight])

  useEffect(() => {
    Action.setHeight(appHeight)
  }, [appHeight])

  return (
    <ThemeWrapper>
      <div ref={baseRef} className='app-container'>
        <SceneGate
          onSceneNotReady={async () => setAppHeight(APP_HEIGHT)}
          onSceneReady={async () => {
            await upgradeMetadata()
            setAppHeight(getCurrentAppHeight(listHeight))
          }}
          loadIfNotReady
        >
          <Header />
          <hr />
          <SceneGate
            loadingChildren={
              <div className='no-scene'>
                <p>Select a scene to start combat.</p>
              </div>
            }
          >
            <SettingsProvider>
              <PlayerProvider>
                <PartyProvider>
                  <PermissionProvider>
                    <TokenProvider>
                      {popoverOptions?.triggerRef && (
                        <Popover
                          isVisible={popoverVisible}
                          onClose={() => setPopoverVisible(false)}
                          triggerRef={popoverOptions.triggerRef}
                          baseRef={baseRef}
                          width={popoverOptions.width}
                          height={popoverOptions.height}
                        >
                          {popoverOptions.content}
                        </Popover>
                      )}
                      <GroupProvider>
                        <InitiativeList
                          onListHeightChange={onListHeightChange}
                          popover={{
                            openPopover: (options: PopoverOptions) => {
                              setPopoverOptions(options)
                              setPopoverVisible(true)
                            },
                            closePopover: () => setPopoverVisible(false),
                            isVisible: popoverVisible,
                          }}
                        />
                      </GroupProvider>
                    </TokenProvider>
                  </PermissionProvider>
                </PartyProvider>
              </PlayerProvider>
            </SettingsProvider>
          </SceneGate>
          <hr />
          <Footer />
        </SceneGate>
      </div>
    </ThemeWrapper>
  )
}

export default DrawSteel

const getCurrentAppHeight = (listHeight: number) => {
  const extraHeight = 78
  const hrHeight = 1
  const defaultListHeight = APP_HEIGHT - (extraHeight + hrHeight)

  /* needed because owl-bear-rodeo height clips the bottom of the list */
  /* needed to match the manifest app height of 300px */
  const padding = 32

  const newHeight = Math.max(
    extraHeight + hrHeight + listHeight + padding,
    defaultListHeight + padding,
  )

  return newHeight
}
