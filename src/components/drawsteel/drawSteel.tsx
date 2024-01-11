import { useEffect, useRef, useState } from 'react'

import './drawSteel.sass'
import {
  TokenState,
  getTokenState,
  setTokenStateListener,
} from '../../obr/tokens.ts'
import {
  PlayerState,
  getPlayerState,
  setPlayerStateListener,
} from '../../obr/player.ts'
import {
  PermissionState,
  getPermissionState,
  setPermissionStateListener,
} from '../../obr/permissions.ts'
import InitiativeList from './initiativeList.tsx'
import OBR from '@owlbear-rodeo/sdk'
import {
  PartyState,
  getPartyState,
  setPartyStateListener,
} from '../../obr/party.ts'

import { clearAllTurns } from '../../obr/contextmenu.ts'
import { ThemeState } from '../../obr/theme.ts'

const DrawSteel = (props: { themeState: ThemeState }) => {
  const [tokenState, setTokenState] = useState<TokenState | undefined>()
  const [playerState, setPlayerState] = useState<PlayerState | undefined>()
  const [partyState, setPartyState] = useState<PartyState | undefined>()
  const [permissionState, setPermissionState] = useState<
    PermissionState | undefined
  >()

  useEffect(() => {
    const setListeners = () => {
      setTokenStateListener(tokenState => {
        setTokenState(tokenState)
      })

      setPlayerStateListener(playerState => {
        setPlayerState(playerState)
      })

      setPartyStateListener(partyState => {
        setPartyState(partyState)
      })

      setPermissionStateListener(permissionState => {
        setPermissionState(permissionState)
      })
    }

    setListeners()
  }, [])

  useEffect(() => {
    const fetchTokenState = async () => {
      try {
        const tokenStateValue = await getTokenState()
        setTokenState(tokenStateValue)
      } catch (error) {
        console.error('Error fetching tokenState:', error)
      }
    }
    if (!tokenState) fetchTokenState()

    const fetchPlayerState = async () => {
      try {
        const playerStateValue = await getPlayerState()
        setPlayerState(playerStateValue)
      } catch (error) {
        console.error('Error fetching playerState:', error)
      }
    }

    if (!playerState) fetchPlayerState()

    const fetchPartyState = async () => {
      try {
        const partyStateValue = await getPartyState()
        setPartyState(partyStateValue)
      } catch (error) {
        console.error('Error fetching partyState:', error)
      }
    }

    if (!partyState) fetchPartyState()

    const fetchPermissionState = async () => {
      try {
        const permissionStateValue = await getPermissionState()
        setPermissionState(permissionStateValue)
      } catch (error) {
        console.error('Error fetching permissionState:', error)
      }
    }

    if (!permissionState) fetchPermissionState()
  }, [])

  const listContainerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const resizeObserver = new ResizeObserver(entries => {
      if (entries.length > 0) {
        const entry = entries[0]
        const borderHeight = entry.contentRect.bottom + entry.contentRect.top
        const listHeight = Math.max(borderHeight, 30)
        OBR.action.setHeight(listHeight + 70 + 1)
      }
    })

    if (listContainerRef.current) {
      resizeObserver.observe(listContainerRef.current)
      return () => {
        resizeObserver.disconnect()
        OBR.action.setHeight(277)
      }
    }
  }, [])

  return (
    <div
      style={{
        color: props.themeState.text.primary,
      }}
      className={'container'}
    >
      <div className={'app-header'}>
        <h1>Draw Steel!</h1>
        <div>
          {tokenState &&
            (tokenState.friendGroups.size > 0 ||
              tokenState.foeGroups.size > 0) && (
              <button
                title='Refresh all turns'
                onClick={() => {
                  clearAllTurns()
                }}
              >
                <svg
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.61061 20 7.46589 18.9525 6 17.2916M9 17H6V17.2916M18.2002 4V6.94416M18.2002 6.94416V6.99993L15.2002 7M6 20V17.2916'
                    stroke={props.themeState.text.secondary}
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>

                {/* <img
                src={'./refresh.svg'}
                alt='Refresh icon'
                title='Refresh all turns'
              /> */}
              </button>
            )}
          {/* to be enabled in future feature */}
          {/* <button>
            <img
              onClick={() => {}}
              src={'./settings.svg'}
              alt='Settings icon'
              title='Open settings'
            />
          </button> */}
        </div>
      </div>
      <div ref={listContainerRef} className={'list-container'}>
        <hr />
        {tokenState && playerState && partyState && permissionState && (
          <>
            <InitiativeList
              title={'Friends'}
              groups={tokenState.friendGroups}
              playerState={playerState}
              partyState={partyState}
              permissionState={permissionState}
              themeState={props.themeState}
            />
            <InitiativeList
              title={'Foes'}
              groups={tokenState.foeGroups}
              playerState={playerState}
              partyState={partyState}
              permissionState={permissionState}
              themeState={props.themeState}
            />
          </>
        )}
      </div>
    </div>
  )
}
export default DrawSteel
