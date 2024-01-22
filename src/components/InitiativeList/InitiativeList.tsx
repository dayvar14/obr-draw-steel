import { useContext, useEffect, useRef, useState } from 'react'
import InitiativeSubList from './InitiativeSubList.tsx'
import { TokenContext } from 'context/TokenContext.tsx'
import { Metadata, Scene, Token } from '@obr'
import { SceneContext } from 'context/SceneContext.tsx'

const InitiativeList: React.FC<{
  onListHeightChange?: (height: number) => void
}> = ({ onListHeightChange }) => {
  const defaultSubListHeight = 100
  const [foeListHeight, setFoeListHeight] =
    useState<number>(defaultSubListHeight)
  const [friendListHeight, setFriendListHeight] =
    useState<number>(defaultSubListHeight)

  const tokenContext = useContext(TokenContext)
  const sceneContext = useContext(SceneContext)

  if (!tokenContext) {
    throw new Error('TokenContext is undefined')
  }

  if (!sceneContext) {
    throw new Error('SceneContext is undefined')
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
        tokenType={Token.TokenType.FRIEND}
        tokenGroups={tokenContext.tokenState.friendGroups}
        onClearButtonClick={async () => {
          await Metadata.clearFriends()
          sceneContext.setFriendsListOrder({
            type: Scene.ListOrderType.NONE,
            indexes: [],
          })
        }}
      />
      <InitiativeSubList
        forwardRef={registerFoeListResizeObserver}
        title={'Foes'}
        tokenType={Token.TokenType.FOE}
        tokenGroups={tokenContext.tokenState.foeGroups}
        onClearButtonClick={async () => {
          await Metadata.clearFoes()
          sceneContext.setFoesListOrder({
            type: Scene.ListOrderType.NONE,
            indexes: [],
          })
        }}
      />
    </div>
  )
}
export default InitiativeList
