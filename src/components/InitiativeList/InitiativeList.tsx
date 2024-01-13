import { useContext, useEffect, useRef, useState } from 'react'
import InitiativeSubList from './InitiativeSubList.tsx'
import { TokenContext } from 'context/TokenContext.tsx'
import { Metadata } from '@obr'

const InitiativeList: React.FC<{
  onListHeightChange?: (height: number) => void
}> = ({ onListHeightChange }) => {
  const defaultSubListHeight = 100
  const [foeListHeight, setFoeListHeight] =
    useState<number>(defaultSubListHeight)
  const [friendListHeight, setFriendListHeight] =
    useState<number>(defaultSubListHeight)

  const tokenContext = useContext(TokenContext)

  if (!tokenContext) {
    throw new Error('TokenContext is undefined')
  }

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

  return (
    <div className={'list-container'}>
      <InitiativeSubList
        forwardRef={registerFriendListResizeObserver}
        title={'Friends'}
        tokenGroups={tokenContext.tokenState.friendGroups}
        onClearButtonClick={() => {
          Metadata.clearFriends()
        }}
      />
      <InitiativeSubList
        forwardRef={registerFoeListResizeObserver}
        title={'Foes'}
        tokenGroups={tokenContext.tokenState.foeGroups}
        onClearButtonClick={() => {
          Metadata.clearFoes()
        }}
      />
    </div>
  )
}
export default InitiativeList
