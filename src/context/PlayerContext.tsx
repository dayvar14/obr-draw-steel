// ThemeContext.tsx
import { Player } from '@obr'
import { isEqual } from 'lodash'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react'

interface PlayerContextProps {
  playerState: Player.PlayerState
  setPlayerState: Dispatch<SetStateAction<Player.PlayerState | undefined>>
}

const PlayerContext = createContext<PlayerContextProps | undefined>(undefined)

const PlayerProvider = ({ children }: { children?: ReactNode }) => {
  const [playerState, setPlayerState] = useState<
    Player.PlayerState | undefined
  >()

  useEffect(() => {
    Player.setPlayerStateListener(newPlayerState => {
      setPlayerState(playerState =>
        isEqual(playerState, newPlayerState) ? playerState : newPlayerState,
      )
    })
  }, [])

  useEffect(() => {
    const fetchPlayerState = async () => {
      try {
        const newPlayerState = await Player.getPlayerState()
        setPlayerState(playerState =>
          isEqual(playerState, newPlayerState) ? playerState : newPlayerState,
        )
      } catch (error) {
        console.error('Error fetching playerState:', error)
      }
    }

    if (!playerState) fetchPlayerState()
  }, [])

  if (playerState) {
    const contextValue: PlayerContextProps = {
      playerState: playerState as Player.PlayerState,
      setPlayerState,
    }

    return (
      <PlayerContext.Provider value={contextValue}>
        {children}
      </PlayerContext.Provider>
    )
  } else return null
}

export { PlayerProvider, PlayerContext }
