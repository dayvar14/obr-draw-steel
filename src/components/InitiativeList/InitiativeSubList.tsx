import { PopoverOptions } from '@components/Popovers/Popover.tsx'
import { Group as GroupData, ListOrderType, SubGroup } from '@data'
import CircleIcon from '@icons/clear_circle.svg?react'
import HamburgerMenuIcon from '@icons/hamburger_menu.svg?react'
import SortFromBottomToTopIcon from '@icons/sort_from_bottom_to_top.svg?react'
import SortFromTopToBottomIcon from '@icons/sort_from_top_to_bottom.svg?react'
import { Group, Player } from '@obr'
import React, { useContext } from 'react'

import { PermissionContext } from 'context/PermissionContext.tsx'
import { PlayerContext } from 'context/PlayerContext.tsx'

import InitiativeSubListItem from './InitiativeSubListItem.tsx'
import { GroupContext } from 'context/GroupContext.tsx'

const InitiativeSubList: React.FC<{
  forwardRef: React.Ref<HTMLDivElement>
  group: GroupData
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
  const groupContext = useContext(GroupContext)

  if (!playerContext || !permissionContext || !groupContext) {
    throw new Error('PlayerContext is undefined')
  }

  const isGM = playerContext.playerState.role === Player.PlayerRole.GM

  const allGroupTokensIds = Object.values(group.subGroupsById).flatMap(
    subGroup => subGroup.tokenIds,
  )

  // hide all tokens if all are hidden
  let allHidden = true

  allHidden = allGroupTokensIds.every(
    tokenId => !groupContext?.tokensById?.[tokenId]?.isVisible,
  )

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
              {group.listOrder === ListOrderType.ALPHA_ASC && (
                <SortFromBottomToTopIcon className='colored large' />
              )}
              {group.listOrder === ListOrderType.ALPHA_DESC && (
                <SortFromTopToBottomIcon className='colored large' />
              )}
              {(group.listOrder === ListOrderType.INDEX ||
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
const getSortedSubGroups = (group: GroupData) => {
  const subGroups = Object.values(group.subGroupsById)

  if (group.listOrder === ListOrderType.ALPHA_DESC) {
    subGroups.sort((a, b) => {
      const nameComparison = a.subGroupName?.localeCompare(b?.subGroupName)
      if (nameComparison !== 0) return nameComparison
      return Object.keys(b.tokenIds).length - Object.keys(a.tokenIds).length
    })
  } else if (group.listOrder === ListOrderType.ALPHA_ASC) {
    subGroups.sort((a, b) => {
      const nameComparison = b.subGroupName?.localeCompare(a?.subGroupName)
      if (nameComparison !== 0) return nameComparison
      return Object.keys(b.tokenIds).length - Object.keys(a?.tokenIds).length
    })
  } else {
    subGroups.sort((a, b) => {
      return a.index - b.index
    })
  }

  return subGroups.map(subGroup => [subGroup.subGroupId, subGroup]) as [
    string,
    SubGroup,
  ][]
}

const getListItems = (
  group: GroupData,
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
