import { GroupType } from '@data'
import RefreshIcon from '@icons/refresh.svg?react'
import SettingsIcon from '@icons/settings.svg?react'
import { Group, Modal } from '@obr'
import { useContext } from 'react'

import { PlayerContext } from 'context/PlayerContext'

export const HeaderButtons: React.FC = () => {
  const playerContext = useContext(PlayerContext)

  if (playerContext?.playerState.role !== 'GM') return null

  return (
    <>
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
    </>
  )
}

const refreshTurnsAndReactions = async () => {
  const groupMetadata = await Group.getGroupMetadata()
  Object.keys(groupMetadata.groupsByType).forEach(groupType => {
    const group = groupMetadata.groupsByType[groupType as GroupType]
    Object.keys(group.subGroupsById).forEach(subGroupId => {
      const subGroup = group.subGroupsById[subGroupId]
      subGroup.currentReaction = 0
      subGroup.currentTurn = 0
    })
  })
  Group.updateGroupMetadata(groupMetadata)
}
