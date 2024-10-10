import { Metadata, Modal, Player } from '@obr'
import RefreshIcon from '@icons/refresh.svg?react'
import SettingsIcon from '@icons/settings.svg?react'
import { useContext } from 'react'
import { PlayerContext } from 'context/PlayerContext'
import { SceneProvider } from 'context/SceneContext'

export const Header: React.FC = () => {
  const playerContext = useContext(PlayerContext)

  return (
    <div className='app-header'>
      <div>
        <h1>Draw Steel!</h1>
      </div>
      <div className='app-header-icons'>
        {playerContext?.playerState.role === Player.PlayerRole.GM && (
          <>
            <SceneProvider>
              <button
                title='Refresh all turns'
                className='rounded-square-icon-button'
                onClick={() => {
                  Metadata.clearAllTurnsAndReactions()
                }}
              >
                <RefreshIcon className='medium filled' />
              </button>
              <button
                title='Open Settings'
                className='rounded-square-icon-button'
                onClick={() => {
                  Modal.openSettings()
                }}
              >
                <SettingsIcon className='medium filled' />
              </button>
            </SceneProvider>
          </>
        )}
      </div>
    </div>
  )
}
