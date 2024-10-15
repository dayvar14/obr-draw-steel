import { useContext, useEffect, useRef, useState } from 'react'
import InitiativeSubList from './InitiativeSubList.tsx'
import { GroupContext } from 'context/GroupContext.tsx'
import { Group, Token } from '@obr'
import { PopoverOptions } from '@components/Popovers/Popover.tsx'

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
    throw new Error('TokenContext is undefined')
  }

  return (
    <div className={'list-container'}>
      <InitiativeSubList
        forwardRef={registerFriendListResizeObserver}
        group={groupContext.groupMetadata.groupsByType[Group.GroupType.FRIEND]}
        onSortButtonClick={onSortButtonClick(
          groupContext.groupMetadata.groupsByType[Group.GroupType.FRIEND],
        )}
        onClearButtonClick={onClearButtonClick(
          groupContext.groupMetadata.groupsByType[Group.GroupType.FRIEND],
        )}
        popover={popover}
      />
      <InitiativeSubList
        forwardRef={registerFoeListResizeObserver}
        group={groupContext.groupMetadata.groupsByType[Group.GroupType.FOE]}
        onSortButtonClick={onSortButtonClick(
          groupContext.groupMetadata.groupsByType[Group.GroupType.FOE],
        )}
        onClearButtonClick={onClearButtonClick(
          groupContext.groupMetadata.groupsByType[Group.GroupType.FOE],
        )}
        popover={popover}
      />
    </div>
  )
}
export default InitiativeList

const onSortButtonClick = (group: Group.Group) => () => {
  let newListOrder: Group.ListOrderType

  if (group.listOrder === Group.ListOrderType.ALPHA_DESC) {
    newListOrder = Group.ListOrderType.ALPHA_ASC
  } else {
    newListOrder = Group.ListOrderType.ALPHA_DESC
  }

  Group.getGroupMetadata().then(groupMetadata => {
    groupMetadata.groupsByType[group.groupType].listOrder = newListOrder
    Group.updateGroupMetadata(groupMetadata)
  })
}

const onClearButtonClick = (group: Group.Group) => () => {
  const tokens = Object.values(group.subGroupsById)
    .map(subGroup => Object.values(subGroup.tokensById))
    .flat()

  Token.clearTokens(tokens)
}
