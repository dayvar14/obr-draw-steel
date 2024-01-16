import { Metadata, Player } from '@obr'
import RefreshIcon from '@icons/refresh.svg?react'
import SettingsIcon from '@icons/settings.svg?react'
import { useContext } from 'react'
import { PlayerContext } from 'context/PlayerContext'

export const Header: React.FC<{ isSceneReady: boolean }> = ({
  isSceneReady,
}) => {
  // If no player context, then assume player is not gm.
  let playerContext = undefined

  if (isSceneReady) {
    playerContext = useContext(PlayerContext)
  }

  let isGM = false

  if (playerContext) {
    isGM = playerContext.playerState.role === Player.PlayerRole.GM
  }

  return (
    <div className='app-header'>
      <h1>Draw Steel!</h1>
      <div className='app-header-icons'>
        {isGM && (
          <>
            {isSceneReady && (
              <button
                title='Refresh all turns'
                className='rounded-square-icon-button'
                onClick={() => {
                  Metadata.clearAllTurns()
                }}
              >
                <RefreshIcon className='medium filled' />
              </button>
            )}
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
