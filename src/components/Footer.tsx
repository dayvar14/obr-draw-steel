import { Player } from '@obr'
import { useContext } from 'react'
import { PlayerContext } from 'context/PlayerContext'
import { SettingsProvider } from 'context/SettingsContext'

export const Footer: React.FC = () => {
  const playerContext = useContext(PlayerContext)

  return (
    <div className='app-footer'>
      <div className='app-footer-icons'>
        {playerContext?.playerState.role === Player.PlayerRole.GM && (
          <>
            <SettingsProvider></SettingsProvider>
          </>
        )}
      </div>
    </div>
  )
}
