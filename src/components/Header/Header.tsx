import { PlayerProvider } from 'context/PlayerContext'
import { SceneGate } from 'wrapper/SceneGate'
import { HeaderButtons } from './HeaderButtons'

export const Header: React.FC = () => {
  return (
    <div className='app-header'>
      <div>
        <h1>Draw Steel!</h1>
      </div>
      <div className='app-header-icons'>
        <SceneGate>
          <PlayerProvider>
            <HeaderButtons />
          </PlayerProvider>
        </SceneGate>
      </div>
    </div>
  )
}
