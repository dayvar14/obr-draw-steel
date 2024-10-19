import { PermissionProvider } from 'context/PermissionContext'
import { PlayerProvider } from 'context/PlayerContext'
import { SettingsProvider } from 'context/SettingsContext'
import ThemeWrapper from 'wrapper/ThemeWrapper'

import SettingsList from './SettingsList'

export const Settings = () => {
  return (
    <SettingsProvider>
      <PlayerProvider>
        <PermissionProvider>
          <ThemeWrapper>
            <div className='settings-container'>
              <SettingsList></SettingsList>
            </div>
          </ThemeWrapper>
        </PermissionProvider>
      </PlayerProvider>
    </SettingsProvider>
  )
}
