import ThemeWrapper from 'wrapper/ThemeWrapper'
import { OptionsList } from './OptionsList/OptionsList'
import { PermissionProvider } from 'context/PermissionContext'
import { PlayerProvider } from 'context/PlayerContext'
import { Popover } from '@obr'
import { TOKEN_OPTIONS_POPOVER_ID } from 'config'
import { SceneProvider } from 'context/SceneContext'

export const TokenOptions = () => {
  const group_id =
    new URLSearchParams(window.location.search).get('group-id') ?? null

  if (!group_id) {
    Popover.closeTokenOptions(TOKEN_OPTIONS_POPOVER_ID)
    return null
  }

  return (
    <SceneProvider>
      <PlayerProvider>
        <PermissionProvider>
          <ThemeWrapper className='options-container'>
            <OptionsList groupId={group_id} />
          </ThemeWrapper>
        </PermissionProvider>
      </PlayerProvider>
    </SceneProvider>
  )
}
