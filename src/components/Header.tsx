import { Group, Modal, Player } from '@obr'
import RefreshIcon from '@icons/refresh.svg?react'
import SettingsIcon from '@icons/settings.svg?react'
import { useContext } from 'react'
import { PlayerContext } from 'context/PlayerContext'
import { SettingsProvider } from 'context/SettingsContext'

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
            <SettingsProvider>
              <button
                title='Refresh all turns'
                className='rounded-square-icon-button'
                onClick={refreshTurnsAndReactions}
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
            </SettingsProvider>
          </>
        )}
      </div>
    </div>
  )
}

const refreshTurnsAndReactions = async () => {
  const groupMetadata = await Group.getGroupMetadata()
  Object.keys(groupMetadata.groupsByType).forEach(groupType => {
    const group = groupMetadata.groupsByType[groupType as Group.GroupType]
    Object.keys(group.subGroupsById).forEach(subGroupId => {
      const subGroup = group.subGroupsById[subGroupId]
      subGroup.currentReaction = 0
      subGroup.currentTurn = 0
    })
  })
  Group.updateGroupMetadata(groupMetadata)
}
