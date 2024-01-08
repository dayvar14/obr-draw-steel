import { useEffect, useRef, useState } from 'react'

import './drawSteel.sass'
import {
  TokenRoles,
  TokenState,
  getTokenState,
  setTokenStateListener,
} from '../../obr/tokens.ts'
import {
  PlayerRole,
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

const DrawSteel = () => {
  const [tokenState, setTokenState] = useState({
    friends: [],
    foes: [],
  } as TokenState)
  const [playerState, setPlayerState] = useState({
    name: 'Player',
    role: PlayerRole.PLAYER,
    color: '#000000',
  } as PlayerState)
  const [partyState, setPartyState] = useState({
    playerStates: [],
  } as PartyState)
  const [permissionState, setPermissionState] = useState({
    permissions: [],
  } as PermissionState)

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

    fetchTokenState()
    const fetchPlayerState = async () => {
      try {
        const playerStateValue = await getPlayerState()
        setPlayerState(playerStateValue)
      } catch (error) {
        console.error('Error fetching playerState:', error)
      }
    }

    fetchPlayerState()

    const fetchPartyState = async () => {
      try {
        const partyStateValue = await getPartyState()
        setPartyState(partyStateValue)
      } catch (error) {
        console.error('Error fetching partyState:', error)
      }
    }

    fetchPartyState()

    const fetchPermissionState = async () => {
      try {
        const permissionStateValue = await getPermissionState()
        setPermissionState(permissionStateValue)
      } catch (error) {
        console.error('Error fetching permissionState:', error)
      }
    }

    fetchPermissionState()
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
    <div className={'container'}>
      <div className={'app-header'}>
        <h1>Draw Steel!</h1>
        <div>
          {(tokenState.friends.length > 0 || tokenState.foes.length > 0) && (
            <button
              onClick={() => {
                clearAllTurns()
              }}
            >
              <img
                src={'./refresh.svg'}
                alt='Refresh icon'
                title='Refresh all turns'
              />
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
        <InitiativeList
          tokenRole={TokenRoles.FRIEND}
          tokens={tokenState.friends}
          playerState={playerState}
          partyState={partyState}
          permissionState={permissionState}
        />
        <InitiativeList
          tokenRole={TokenRoles.FOE}
          tokens={tokenState.foes}
          playerState={playerState}
          partyState={partyState}
          permissionState={permissionState}
        />
      </div>
    </div>
  )
}
export default DrawSteel
