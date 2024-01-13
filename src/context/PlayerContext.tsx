// ThemeContext.tsx
import { Player } from '@obr'
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
    Player.setPlayerStateListener(playerState => {
      setPlayerState(playerState)
    })
  }, [])

  useEffect(() => {
    const fetchPlayerState = async () => {
      try {
        const playerStateValue = await Player.getPlayerState()
        setPlayerState(playerStateValue)
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
