import SceneGate from 'wrapper/SceneGate'
import ThemeWrapper from 'wrapper/ThemeWrapper'
import { PermissionProvider } from 'context/PermissionContext'
import { PlayerProvider } from 'context/PlayerContext'
import { PluginGate } from 'wrapper/PluginGate'
import SettingsList from './SettingsList/SettingsList'

export const Settings = () => {
  return (
    <PluginGate>
      <SceneGate>
        <PlayerProvider>
          <PermissionProvider>
            <ThemeWrapper className='settings-container'>
              <SettingsList></SettingsList>
            </ThemeWrapper>
          </PermissionProvider>
        </PlayerProvider>
      </SceneGate>
    </PluginGate>
  )
}
