import InitiativeSubListItem from './InitiativeSubListItem.tsx'
import React, { useContext } from 'react'
import { Group, Player } from '@obr'
import { PlayerContext } from 'context/PlayerContext.tsx'

import CircleIcon from '@icons/clear_circle.svg?react'
import SortFromBottomToTopIcon from '@icons/sort_from_bottom_to_top.svg?react'
import SortFromTopToBottomIcon from '@icons/sort_from_top_to_bottom.svg?react'
import HamburgerMenuIcon from '@icons/hamburger_menu.svg?react'
import { PopoverOptions } from '@components/Popovers/Popover.tsx'
import { PermissionContext } from 'context/PermissionContext.tsx'

const InitiativeSubList: React.FC<{
  forwardRef: React.Ref<HTMLDivElement>
  group: Group.Group
  onClearButtonClick?: () => void
  onSortButtonClick?: () => void
  popover?: {
    openPopover?: (options: PopoverOptions) => void
    closePopover?: () => void
    isVisble?: boolean
  }
}> = ({
  forwardRef,
  group,
  onClearButtonClick,
  onSortButtonClick,
  popover,
}) => {
  const playerContext = useContext(PlayerContext)
  const permissionContext = useContext(PermissionContext)

  if (!playerContext || !permissionContext) {
    throw new Error('PlayerContext is undefined')
  }

  const isGM = playerContext.playerState.role === Player.PlayerRole.GM
  const isOwnerOnly = permissionContext.permissionState.permissions.includes(
    'CHARACTER_OWNER_ONLY',
  )

  // hide all tokens if all are hidden
  let allHidden = true

  const allTokens = Object.values(group.subGroupsById).flatMap(subGroup =>
    Object.values(subGroup.tokensById),
  )

  for (const token of allTokens) {
    if (token.isVisible) {
      allHidden = false
      break
    }
  }

  const listItems = getListItems(group, popover)

  return (
    <div ref={forwardRef}>
      <div className='sub-list-header'>
        <h2>{Group.getNameFromGroupType(group.groupType)}</h2>
        {playerContext.playerState.role === Player.PlayerRole.GM && (
          <div className='sub-list-header-icons'>
            <button
              className='rounded-square-icon-button'
              title={`Sort ${Group.getNameFromGroupType(group.groupType)}`}
              onClick={onSortButtonClick}
            >
              {group.listOrder === Group.ListOrderType.ALPHA_ASC && (
                <SortFromBottomToTopIcon className='colored large' />
              )}
              {group.listOrder === Group.ListOrderType.ALPHA_DESC && (
                <SortFromTopToBottomIcon className='colored large' />
              )}
              {(group.listOrder === Group.ListOrderType.INDEX ||
                group.listOrder === undefined) && (
                <HamburgerMenuIcon className='colored large' />
              )}
            </button>
            <button
              className='rounded-square-icon-button'
              title={`Clear all ${Group.getNameFromGroupType(group.groupType)}`}
              onClick={onClearButtonClick}
            >
              <CircleIcon className='colored large' />
            </button>
          </div>
        )}
      </div>
      <hr />
      <ul className='sub-list'>
        {listItems.length > 0 && (!allHidden || isGM) ? (
          listItems
        ) : (
          <p>
            {isGM ? (
              <small>Select a character to add</small>
            ) : (
              <small>Waiting on director...</small>
            )}
          </p>
        )}
      </ul>
    </div>
  )
}
const getSortedSubGroups = (group: Group.Group) => {
  const subGroups = Object.values(group.subGroupsById)

  if (group.listOrder === Group.ListOrderType.ALPHA_DESC) {
    subGroups.sort((a, b) => {
      const nameComparison = a.subGroupName.localeCompare(b.subGroupName)
      if (nameComparison !== 0) return nameComparison
      return Object.keys(b.tokensById).length - Object.keys(a.tokensById).length
    })
  } else if (group.listOrder === Group.ListOrderType.ALPHA_ASC) {
    subGroups.sort((a, b) => {
      const nameComparison = b.subGroupName.localeCompare(a.subGroupName)
      if (nameComparison !== 0) return nameComparison
      return Object.keys(b.tokensById).length - Object.keys(a.tokensById).length
    })
  } else {
    subGroups.sort((a, b) => {
      return a.index - b.index
    })
  }

  return subGroups.map(subGroup => [subGroup.subGroupId, subGroup]) as [
    string,
    Group.SubGroup,
  ][]
}

const getListItems = (
  group: Group.Group,
  popover?: {
    openPopover?: (options: PopoverOptions) => void
    closePopover?: () => void
    isVisble?: boolean
  },
) => {
  const listItems = getSortedSubGroups(group).map(([subGroupId, subGroup]) => {
    if (Object.keys(subGroup).length > 0)
      return (
        <InitiativeSubListItem
          key={subGroupId}
          subGroup={subGroup}
          onTurnChange={() => {
            subGroup.currentTurn =
              (subGroup.currentTurn + 1) % (subGroup.maxTurns + 1)
            Group.updateSubgroupByGroupType(group.groupType, subGroup)
          }}
          onReactionChange={() => {
            subGroup.currentReaction =
              (subGroup.currentReaction + 1) % (subGroup.maxReactions + 1)
            Group.updateSubgroupByGroupType(group.groupType, subGroup)
          }}
          popover={popover}
        />
      )
    else return
  })

  return listItems
}

export default InitiativeSubList
