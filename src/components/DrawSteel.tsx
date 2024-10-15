import InitiativeList from './InitiativeList/InitiativeList.tsx'
import ThemeWrapper from '../wrapper/ThemeWrapper.tsx'
import { Header } from './Header.tsx'
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

const DrawSteel = () => {
  const [listHeight, setListHeight] = useState(0)
  const [popoverVisible, setPopoverVisible] = useState<boolean>(false)
  const [popoverOptions, setPopoverOptions] = useState<PopoverOptions>()
  const baseRef = useRef<HTMLDivElement>(null)

  const onListHeightChange = (listHeight: number) => {
    setListHeight(listHeight)
  }

  /* might want to refactor this in the future */
  useEffect(() => {
    const setNewAppHeight = async () => {
      // extra height needed to be accounted for. Header and footer
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
      await Action.setHeight(newHeight)
    }
    setNewAppHeight()
  }, [listHeight])

  return (
    <div ref={baseRef} className={'app-container'}>
      <ThemeWrapper className={'app-container'}>
        {popoverOptions?.triggerRef && (
          <Popover
            isVisible={popoverVisible}
            onClose={() => setPopoverVisible(false)}
            triggerRef={popoverOptions?.triggerRef}
            baseRef={baseRef}
            width={popoverOptions.width}
            height={popoverOptions.height}
          >
            {popoverOptions?.content}
          </Popover>
        )}

        <PlayerProvider>
          <Header />
          <hr />

          <SettingsProvider
            loadingChildren={
              <div className={'no-scene'}>
                <p>Select a scene to start combat.</p>
              </div>
            }
          >
            <PartyProvider>
              <PermissionProvider>
                <GroupProvider>
                  <InitiativeList
                    onListHeightChange={(listHeight: number) =>
                      onListHeightChange(listHeight)
                    }
                    popover={{
                      openPopover: (options: PopoverOptions) => {
                        setPopoverOptions(options)
                        setPopoverVisible(true)
                      },
                      closePopover: () => {
                        setPopoverVisible(false)
                      },
                      isVisible: popoverVisible,
                    }}
                  />
                </GroupProvider>
              </PermissionProvider>
            </PartyProvider>
          </SettingsProvider>
          <hr />
          <Footer />
        </PlayerProvider>
      </ThemeWrapper>
    </div>
  )
}

export default DrawSteel
