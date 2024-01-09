import React, { useEffect, useState } from 'react'

import { Token } from '../../obr/tokens.ts'
import { PlayerRole, PlayerState } from '../../obr/player.ts'
import { PartyState } from '../../obr/party.ts'
import { PermissionState } from '../../obr/permissions.ts'
import InitiativeListItem from './initiativeListItem.tsx'
import { clearFoes, clearFriends } from '../../obr/contextmenu.ts'

const InitiativeList = (props: {
  tokens: Token[]
  title: string
  playerState: PlayerState
  partyState: PartyState
  permissionState: PermissionState
}) => {
  const [tokens] = useState(props.tokens)
  const [checkedList, setCheckedList] = useState({} as Record<string, Token>)

  useEffect(() => {
    const startingCheckList: Record<string, Token> = Object.fromEntries(
      props.tokens.map(token => [token.id, token]),
    )

    setCheckedList(startingCheckList)
  }, [tokens])

  const onCheckedChange: React.ComponentProps<
    typeof InitiativeListItem
  >['onCheckedChange'] = (isChecked, token) => {
    if (isChecked) {
      const newCheckedList = { ...checkedList }
      delete newCheckedList[token.id]
      setCheckedList(newCheckedList)
    } else {
      const newCheckedList = { ...checkedList, [token.id]: token }
      setCheckedList(newCheckedList)
    }
  }

  const listItems = props.tokens.map((item, index) => (
    <InitiativeListItem
      key={item.id}
      index={index}
      token={item}
      playerState={props.playerState}
      partyState={props.partyState}
      permissionState={props.permissionState}
      onCheckedChange={onCheckedChange}
    />
  ))

  return (
    <>
      <div className='list-header'>
        <h2>{props.title}</h2>
        {/* To be enabled in future feature */}
        {/* {Object.keys(props.tokens).length > 0 && (
          <small>{`${Object.keys(checkedList).length}/${
            Object.keys(props.tokens).length
          }`}</small>
        )} */}
        {props.playerState.role === PlayerRole.GM && (
          <div>
            {/* <button>
              <img src={'./sort-by-alphabet.svg'} />
            </button>
            <button>
              <img src={'./sort-from-top-to-bottom.svg'} />
            </button> */}
            <button>
              <img
                title={`Clear all ${props.title}`}
                src={'./clear-circle.svg'}
                onClick={() => {
                  if (props.title === 'Friends') {
                    clearFriends()
                  }
                  if (props.title === 'Foes') {
                    clearFoes()
                  }
                }}
              />
            </button>
          </div>
        )}
      </div>
      <hr />
      <ul>
        {listItems.length > 0 ? (
          listItems
        ) : (
          <p>
            <small>Select a character to add</small>
          </p>
        )}
      </ul>
    </>
  )
}

export default InitiativeList
