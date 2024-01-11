import React, { useState } from 'react'

import { Token } from '../../obr/tokens.ts'
import { PlayerRole, PlayerState } from '../../obr/player.ts'
import { PartyState } from '../../obr/party.ts'
import { PermissionState } from '../../obr/permissions.ts'
import InitiativeListItem from './initiativeListItem.tsx'
import Metadata from '../../obr/metadata.ts'
import { ThemeState } from '../../obr/theme.ts'

const InitiativeList = (props: {
  groups: Map<string, Token[]>
  title: string
  playerState: PlayerState
  partyState: PartyState
  permissionState: PermissionState
  themeState: ThemeState
}) => {
  const [checkedList, setCheckedList] = useState<Set<string>>(
    new Set(props.groups.keys()),
  )

  // useEffect(() => {
  //   const startingCheckList = new Set(props.groups.keys())
  //   setCheckedList(startingCheckList)
  // }, [])

  const onCheckedChange: React.ComponentProps<
    typeof InitiativeListItem
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

  const listItems = Array.from(props.groups).map(([groupId, tokenList]) => (
    <InitiativeListItem
      key={groupId}
      groupId={groupId}
      tokens={tokenList}
      playerState={props.playerState}
      partyState={props.partyState}
      permissionState={props.permissionState}
      themeState={props.themeState}
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
            <button
              title={`Clear all ${props.title}`}
              onClick={() => {
                if (props.title === 'Friends') {
                  Metadata.clearFriends()
                }
                if (props.title === 'Foes') {
                  Metadata.clearFoes()
                }
              }}
            >
              <svg
                width='24'
                height='24'
                viewBox='0 0 24 24'
                fill='none'
                xmlns='http://www.w3.org/2000/svg'
              >
                <path
                  d='M9 9L15 15'
                  stroke={props.themeState.text.secondary}
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <path
                  d='M15 9L9 15'
                  stroke={props.themeState.text.secondary}
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
                <circle
                  cx='12'
                  cy='12'
                  r='9'
                  stroke={props.themeState.text.secondary}
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                />
              </svg>
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
