import { useEffect, useState } from 'react'
import clsx from 'clsx'

import { Token } from '../../obr/tokens.ts'
import {
  PlayerRole,
  PlayerState,
  centerPlayerOnTokens,
  selectTokens,
} from '../../obr/player.ts'
import { toggleTokensTurn } from '../../obr/contextmenu.ts'
import { PartyState } from '../../obr/party.ts'
import { PermissionState } from '../../obr/permissions.ts'
import { ThemeState } from '../../obr/theme.ts'

const InitiativeListItem = (props: {
  groupId: string
  tokens: Token[]
  playerState: PlayerState
  partyState: PartyState
  permissionState: PermissionState
  themeState: ThemeState
  onCheckedChange: (isChecked: boolean, groupId: string) => void
}) => {
  const [isChecked, setChecked] = useState(false)
  const [isMouseOverToken, setMouseOverToken] = useState(false)

  const isOwnerOnly = props.permissionState.permissions.includes(
    'CHARACTER_OWNER_ONLY',
  )

  const isGM = props.playerState.role === PlayerRole.GM

  const ownerIds = new Set<string>()
  for (const token of props.tokens) {
    ownerIds.add(token.createdUserId)
  }

  const isOwner = ownerIds.has(props.playerState.id)

  const hasModifyPermissions = isGM || !isOwnerOnly || (isOwnerOnly && isOwner)

  const playerOwners: PlayerState[] = []

  if (!isOwner && props.partyState && props.partyState.playerStates) {
    for (const playerState of props.partyState.playerStates) {
      if (ownerIds.has(playerState.id)) {
        playerOwners.push(playerState)
      }
    }
  }

  useEffect(() => {
    // Default the group's hasTurn to true if group members don't have the same turn state
    let isChecked = true
    const tokensWithoutTurns: Token[] = []

    for (const token of props.tokens) {
      if (!token.hasTurn) {
        isChecked = false
      } else {
        tokensWithoutTurns.push(token)
      }
    }

    // Set the metadata for each token to have a turn if group members don't have the same turn state
    if (isChecked === true && tokensWithoutTurns.length > 0) {
      toggleTokensTurn(props.tokens, isChecked)
    }

    setChecked(isChecked)
  }, [props.tokens])

  const handleCheckboxChange = () => {
    const checked = !isChecked
    setChecked(checked)
    toggleTokensTurn(props.tokens, isChecked)
    props.onCheckedChange(checked, props.groupId)
  }

  const listClassnames = clsx({ done: isChecked })

  async function handleDoubleClick() {
    centerPlayerOnTokens(props.tokens)
  }

  async function handleClick() {
    selectTokens(props.tokens)
  }

  return (
    <li
      className={listClassnames}
      // draggable={hasModifyPermissions}
      // onDragStart={props.onDragStart}
      // onDragOver={props.onDragOver}
      // onDragEnd={props.onDragEnd}
    >
      <img
        src={props.tokens[0].imageUrl}
        alt={`Token image of ${props.tokens[0].name}`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => {
          setMouseOverToken(true)
        }}
        onMouseLeave={() => {
          setMouseOverToken(true)
        }}
        style={
          isMouseOverToken && playerOwners[0]?.color
            ? { boxShadow: `0px 0px 10px ${playerOwners[0].color}` }
            : {}
        }
      />
      <span>{props.tokens[0].name}</span>
      {props.tokens.length > 1 && <small>x{props.tokens.length}</small>}
      <input
        checked={isChecked}
        disabled={!hasModifyPermissions}
        className={clsx({ disabled: !hasModifyPermissions })}
        onChange={() => {
          if (!hasModifyPermissions) return
          handleCheckboxChange()
        }}
        type={'checkbox'}
        id={props.groupId}
      />
      <label
        title={isChecked ? 'Reset turn' : 'Finish turn'}
        className={clsx({ disabled: !hasModifyPermissions })}
        htmlFor={props.groupId}
        role={'application'}
      >
        {isChecked ? (
          <svg
            width='15'
            height='15'
            viewBox='0 0 24 24'
            fill='none'
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M5 21V3.90002C5 3.90002 5.875 3 8.5 3C11.125 3 12.875 4.8 15.5 4.8C18.125 4.8 19 3.9 19 3.9V14.7C19 14.7 18.125 15.6 15.5 15.6C12.875 15.6 11.125 13.8 8.5 13.8C5.875 13.8 5 14.7 5 14.7'
              stroke={
                isOwner
                  ? props.themeState.primary.light
                  : props.themeState.text.primary
              }
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
        ) : (
          // <img
          //   width={15}
          //   height={15}
          //   src={'./flag_done.svg'}
          //   alt={`Reset turn flag for the ${props.token.name} token`}
          // />
          <svg
            width='15'
            height='15'
            viewBox='0 0 24 24'
            fill={
              isOwner
                ? props.themeState.primary.light
                : props.themeState.text.primary
            }
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M5 21V3.90002C5 3.90002 5.875 3 8.5 3C11.125 3 12.875 4.8 15.5 4.8C18.125 4.8 19 3.9 19 3.9V14.7C19 14.7 18.125 15.6 15.5 15.6C12.875 15.6 11.125 13.8 8.5 13.8C5.875 13.8 5 14.7 5 14.7'
              stroke={
                isOwner
                  ? props.themeState.primary.light
                  : props.themeState.text.primary
              }
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>

          // <img
          //   width={15}
          //   height={15}
          //   src={'./flag_not_done.svg'}
          //   alt={`Finish turn flag for the ${props.token.name} token`}
          // />
        )}
      </label>

      {/* to be enabled in future feature */}
      {/* <button
        title={'More options'}
        className={clsx({ disabled: !hasModifyPermissions })}
        onClick={() => {}}
      >
        <img
          alt={`More options for the ${props.token.name} token`}
          width={15}
          height={15}
          src={'./vhamburger.svg'}
        />
      </button> */}
    </li>
  )
}

export default InitiativeListItem
