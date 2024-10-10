import ThemeWrapper from 'wrapper/ThemeWrapper'
import { PermissionProvider } from 'context/PermissionContext'
import { PlayerProvider } from 'context/PlayerContext'
import SettingsList from './SettingsList'
import { SceneProvider } from 'context/SceneContext'

export const Settings = () => {
  return (
    <SceneProvider>
      <PlayerProvider>
        <PermissionProvider>
          <ThemeWrapper className='settings-container'>
            <SettingsList></SettingsList>
          </ThemeWrapper>
        </PermissionProvider>
      </PlayerProvider>
    </SceneProvider>
  )
}
