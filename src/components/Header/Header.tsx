import { Metadata, Player } from '@obr'
import RefreshIcon from '@icons/refresh.svg?react'
import SettingsIcon from '@icons/settings.svg?react'
import { useContext } from 'react'
import { PlayerContext } from 'context/PlayerContext'
import SceneGate from 'wrapper/SceneGate'

export const Header: React.FC = () => {
  const playerContext = useContext(PlayerContext)

  return (
    <div className='app-header'>
      <h1>Draw Steel!</h1>
      <div className='app-header-icons'>
        {playerContext?.playerState.role === Player.PlayerRole.GM && (
          <>
            <SceneGate>
              <button
                title='Refresh all turns'
                className='rounded-square-icon-button'
                onClick={() => {
                  Metadata.clearAllTurns()
                }}
              >
                <RefreshIcon className='medium filled' />
              </button>
            </SceneGate>
            <button
              title='Refresh all turns'
              className='rounded-square-icon-button'
              onClick={() => {}}
            >
              <SettingsIcon className='medium filled' />
            </button>
          </>
        )}
      </div>
    </div>
  )
}
