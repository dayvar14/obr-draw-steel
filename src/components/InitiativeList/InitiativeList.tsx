import { PopoverOptions } from '@components/Popovers/Popover.tsx'
import { Group as GroupData, GroupType, ListOrderType } from '@data'
import { Group, Token } from '@obr'
import { useContext, useEffect, useRef, useState } from 'react'

import { GroupContext } from 'context/GroupContext.tsx'

import InitiativeSubList from './InitiativeSubList.tsx'

const InitiativeList: React.FC<{
  onListHeightChange?: (height: number) => void
  popover?: {
    openPopover?: (options: PopoverOptions) => void
    closePopover?: () => void
    isVisible?: boolean
  }
}> = ({ onListHeightChange, popover }) => {
  const defaultSubListHeight = 100
  const [foeListHeight, setFoeListHeight] =
    useState<number>(defaultSubListHeight)
  const [friendListHeight, setFriendListHeight] =
    useState<number>(defaultSubListHeight)

  const groupContext = useContext(GroupContext)

  /* following pattern required to set observer on ref only after it is defined */
  /* found here: https://flareapp.io/blog/you-might-not-need-useref-for-that */
  const createResizeObserverFunc = (setHeight: (height: number) => void) => {
    return (entries: ResizeObserverEntry[]) => {
      if (entries.length > 0) {
        const borderHeight =
          entries[0].contentRect.bottom + entries[0].contentRect.top
        setHeight(borderHeight)
      }
    }
  }

  const foeListObserver = useRef<ResizeObserver>(
    new ResizeObserver(createResizeObserverFunc(setFoeListHeight)),
  )

  const friendListObserver = useRef<ResizeObserver>(
    new ResizeObserver(createResizeObserverFunc(setFriendListHeight)),
  )

  const createRegisterResizeObserverFunc = (
    observer: React.MutableRefObject<ResizeObserver>,
  ) => {
    return (instance: HTMLDivElement | null) => {
      if (instance) return observer.current.observe(instance)

      observer.current.disconnect()
    }
  }

  const registerFoeListResizeObserver =
    createRegisterResizeObserverFunc(foeListObserver)
  const registerFriendListResizeObserver =
    createRegisterResizeObserverFunc(friendListObserver)

  useEffect(() => {
    if (!onListHeightChange) {
      return
    }

    const totalListHeight = foeListHeight + friendListHeight
    onListHeightChange(totalListHeight)
  }, [foeListHeight, friendListHeight])

  if (!groupContext) {
    return
  }

  return (
    <div className={'list-container'}>
      <InitiativeSubList
        forwardRef={registerFriendListResizeObserver}
        group={groupContext.groupMetadata.groupsByType[GroupType.ALLY]}
        onSortButtonClick={onSortButtonClick(
          groupContext.groupMetadata.groupsByType[GroupType.ALLY],
        )}
        onClearButtonClick={onClearButtonClick(
          groupContext.groupMetadata.groupsByType[GroupType.ALLY],
          GroupType.ALLY,
        )}
        popover={popover}
      />
      <InitiativeSubList
        forwardRef={registerFoeListResizeObserver}
        group={groupContext.groupMetadata.groupsByType[GroupType.ENEMY]}
        onSortButtonClick={onSortButtonClick(
          groupContext.groupMetadata.groupsByType[GroupType.ENEMY],
        )}
        onClearButtonClick={onClearButtonClick(
          groupContext.groupMetadata.groupsByType[GroupType.ENEMY],
          GroupType.ENEMY,
        )}
        popover={popover}
      />
    </div>
  )
}
export default InitiativeList

const onSortButtonClick = (group: GroupData) => () => {
  let newListOrder: ListOrderType

  if (group.listOrder === ListOrderType.ALPHA_DESC) {
    newListOrder = ListOrderType.ALPHA_ASC
  } else {
    newListOrder = ListOrderType.ALPHA_DESC
  }

  Group.getGroupMetadata().then(groupMetadata => {
    groupMetadata.groupsByType[group.groupType].listOrder = newListOrder
    Group.updateGroupMetadata(groupMetadata)
  })
}

const onClearButtonClick = (group: GroupData, groupType: GroupType) => () => {
  const tokensId = Object.values(group.subGroupsById)
    .map(subGroup => Object.values(subGroup.tokenIds))
    .flat()
  Token.clearTokensById(tokensId)
  Group.clearSubGroups(groupType)
}
