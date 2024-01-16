import InitiativeSubListItem from './InitiativeSubListItem.tsx'
import React, { useContext, useState } from 'react'
import { Player, Token } from '@obr'
import { PlayerContext } from 'context/PlayerContext.tsx'

import CircleIcon from '@icons/clear_circle.svg?react'

const InitiativeSubList: React.FC<{
  forwardRef: React.Ref<HTMLDivElement>
  tokenGroups: Map<string, Token.Token[]>
  onClearButtonClick?: () => void
  title: string
}> = ({ tokenGroups, onClearButtonClick, title, forwardRef }) => {
  const playerContext = useContext(PlayerContext)

  if (!playerContext) {
    throw new Error('PlayerContext is undefined')
  }

  const [checkedList, setCheckedList] = useState<Set<string>>(
    new Set(tokenGroups.keys()),
  )

  const isGM = playerContext.playerState.role === Player.PlayerRole.GM

  // useEffect(() => {
  //   const startingCheckList = new Set(groups.keys())
  //   setCheckedList(startingCheckList)
  // }, [])

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

  const listItems = Array.from(tokenGroups).map(([groupId, tokenList]) => (
    <InitiativeSubListItem
      key={groupId}
      groupId={groupId}
      tokens={tokenList}
      onCheckedChange={onCheckedChange}
    />
  ))

  // hide all tokens if all are hidden
  let allHidden = true

  tokenGroups.forEach((tokens, groupId) => {
    for (const token of tokens) {
      if (token.isVisible) {
        allHidden = false
        break
      }
    }
  })

  return (
    <div ref={forwardRef}>
      <div className='sub-list-header'>
        <h2>{title}</h2>
        {playerContext.playerState.role === Player.PlayerRole.GM && (
          <div className='sub-list-header-icons'>
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
