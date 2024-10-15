import ThemeWrapper from 'wrapper/ThemeWrapper'
import { PermissionProvider } from 'context/PermissionContext'
import { PlayerProvider } from 'context/PlayerContext'
import SettingsList from './SettingsList'
import { SettingsProvider } from 'context/SettingsContext'

export const Settings = () => {
  return (
    <SettingsProvider>
      <PlayerProvider>
        <PermissionProvider>
          <ThemeWrapper className='settings-container'>
            <SettingsList></SettingsList>
          </ThemeWrapper>
        </PermissionProvider>
      </PlayerProvider>
    </SettingsProvider>
  )
}
