import InitiativeSubListItem from './InitiativeSubListItem.tsx'
import React, { useContext, useState } from 'react'
import { Player, Scene, Token } from '@obr'
import { PlayerContext } from 'context/PlayerContext.tsx'
import { SceneContext } from 'context/SceneContext.tsx'

import CircleIcon from '@icons/clear_circle.svg?react'
import SortFromBottomToTopIcon from '@icons/sort_from_bottom_to_top.svg?react'
import SortFromTopToBottomIcon from '@icons/sort_from_top_to_bottom.svg?react'
import HamburgerMenuIcon from '@icons/hamburger_menu.svg?react'

const InitiativeSubList: React.FC<{
  forwardRef: React.Ref<HTMLDivElement>
  tokenGroups: Map<string, Token.Token[]>
  onClearButtonClick?: () => void
  title: string
  tokenType: Token.TokenType
}> = ({ tokenGroups, onClearButtonClick, title, forwardRef, tokenType }) => {
  const playerContext = useContext(PlayerContext)
  const sceneContext = useContext(SceneContext)

  if (!playerContext) {
    throw new Error('PlayerContext is undefined')
  }

  if (!sceneContext) {
    throw new Error('SceneContext is undefined')
  }

  const [checkedList, setCheckedList] = useState<Set<string>>(
    new Set(tokenGroups.keys()),
  )

  const [unreactedList, setUnreactedList] = useState<Set<string>>(
    new Set(tokenGroups.keys()),
  )

  const isGM = playerContext.playerState.role === Player.PlayerRole.GM

  const onCheckedChange: React.ComponentProps<
    typeof InitiativeSubListItem
  >['onCheckedChange'] = (isChecked, groupId) => {
    if (checkedList) {
      if (isChecked) {
        const newCheckedList = new Set<string>(checkedList)
        newCheckedList.delete(groupId)
        setCheckedList(newCheckedList)
      } else {
        const newCheckedList = new Set<string>(checkedList)
        newCheckedList.add(groupId)
        setCheckedList(newCheckedList)
      }
    }
  }

  const onReactionChange: React.ComponentProps<
    typeof InitiativeSubListItem
  >['onReactionChange'] = (isUnreacted, groupId) => {
    if (unreactedList) {
      if (isUnreacted) {
        const newUnreactedList = new Set<string>(unreactedList)
        newUnreactedList.delete(groupId)
        setUnreactedList(newUnreactedList)
      } else {
        const newUnreactedList = new Set<string>(unreactedList)
        newUnreactedList.add(groupId)
        setUnreactedList(newUnreactedList)
      }
    }
  }

  // hide all tokens if all are hidden
  let allHidden = true

  tokenGroups.forEach(tokens => {
    for (const token of tokens) {
      if (token.isVisible) {
        allHidden = false
        break
      }
    }
  })

  let listOrder: Scene.ListOrderMetadata

  let setListFunct: (listOrder: Scene.ListOrderMetadata) => void

  if (tokenType === Token.TokenType.FRIEND) {
    listOrder = sceneContext.friendsListOrder
    setListFunct = sceneContext.setFriendsListOrder
  } else {
    listOrder = sceneContext.foesListOrder
    setListFunct = sceneContext.setFoesListOrder
  }

  const getSortedTokens = () => {
    if (listOrder.type === Scene.ListOrderType.ALPHA_ASC) {
      return Array.from(tokenGroups).sort((a, b) => {
        const [, tokenList] = a
        const [, tokenList2] = b
        return tokenList2[0].name.localeCompare(tokenList[0].name)
      })
    } else if (listOrder.type === Scene.ListOrderType.ALPHA_DESC) {
      return Array.from(tokenGroups).sort((a, b) => {
        const [, tokenList] = a
        const [, tokenList2] = b
        return tokenList[0].name.localeCompare(tokenList2[0].name)
      })
    } else {
      return Array.from(tokenGroups)
    }
  }

  const listItems = getSortedTokens().map(([groupId, tokenList]) => (
    <InitiativeSubListItem
      key={groupId}
      groupId={groupId}
      tokens={tokenList}
      onCheckedChange={onCheckedChange}
      onReactionChange={onReactionChange}
    />
  ))

  const onSortButtonClick = () => {
    if (listOrder.type === Scene.ListOrderType.ALPHA_DESC) {
      setListFunct({
        type: Scene.ListOrderType.ALPHA_ASC,
        indexes: [],
      })
    } else if (listOrder.type === Scene.ListOrderType.ALPHA_ASC) {
      setListFunct({
        type: Scene.ListOrderType.NONE,
        indexes: [],
      })
    } else {
      setListFunct({
        type: Scene.ListOrderType.ALPHA_DESC,
        indexes: [],
      })
    }
  }

  return (
    <div ref={forwardRef}>
      <div className='sub-list-header'>
        <h2>{title}</h2>
        {playerContext.playerState.role === Player.PlayerRole.GM && (
          <div className='sub-list-header-icons'>
            <button
              className='rounded-square-icon-button'
              title={`Sort ${title}`}
              onClick={onSortButtonClick}
            >
              {listOrder.type === Scene.ListOrderType.ALPHA_DESC && (
                <SortFromTopToBottomIcon className='colored large' />
              )}
              {listOrder.type === Scene.ListOrderType.ALPHA_ASC && (
                <SortFromBottomToTopIcon className='colored large' />
              )}
              {(listOrder.type === Scene.ListOrderType.INDEX ||
                listOrder.type === Scene.ListOrderType.NONE) && (
                <HamburgerMenuIcon className='colored large' />
              )}
            </button>
            <button
              className='rounded-square-icon-button'
              title={`Clear all ${title}`}
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
              <small>Select your character to add</small>
            )}
          </p>
        )}
      </ul>
    </div>
  )
}

export default InitiativeSubList
