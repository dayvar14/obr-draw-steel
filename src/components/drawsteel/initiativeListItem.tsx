import { useEffect, useState } from 'react'
import clsx from 'clsx'

import { Token } from '../../obr/tokens.ts'
import {
  PlayerRole,
  PlayerState,
  centerPlayerOnToken,
  selectToken,
} from '../../obr/player.ts'
import { toggleTokenTurn } from '../../obr/contextmenu.ts'
import { PartyState } from '../../obr/party.ts'
import { PermissionState } from '../../obr/permissions.ts'
import { ThemeState } from '../../obr/theme.ts'

const InitiativeListItem = (props: {
  index: number
  token: Token
  playerState: PlayerState
  partyState: PartyState
  permissionState: PermissionState
  themeState: ThemeState
  onCheckedChange: (isChecked: boolean, token: Token) => void
  // onDragStart: React.DOMAttributes<HTMLLIElement>['onDragStart']
  // onDragOver: React.DOMAttributes<HTMLLIElement>['onDragOver']
  // onDragEnd: React.DOMAttributes<HTMLLIElement>['onDragEnd']
}) => {
  const [isChecked, setChecked] = useState(false)
  const [isMouseOverToken, setMouseOverToken] = useState(false)

  const isOwnerOnly = props.permissionState.permissions.includes(
    'CHARACTER_OWNER_ONLY',
  )

  const isGM = props.playerState.role === PlayerRole.GM
  const isOwner = props.playerState.id === props.token.createdUserId

  const hasModifyPermissions = isGM || !isOwnerOnly || (isOwnerOnly && isOwner)

  let playerOwner: PlayerState | undefined = props.playerState

  // TODO figure out why partystate is being set to null causing this to require null chekcs
  if (!isOwner && props.partyState && props.partyState.playerStates) {
    const filteredPlayerStates = props.partyState.playerStates.filter(
      playerState => playerState.id === props.token.createdUserId,
    )

    if (filteredPlayerStates.length > 0) {
      playerOwner = filteredPlayerStates[0]
    }
  }

  useEffect(() => {
    let checked = false

    checked = props.token.hasTurn

    setChecked(checked)
  }, [props.token])

  const handleCheckboxChange = () => {
    const checked = !isChecked
    setChecked(checked)

    toggleTokenTurn(props.token.id, checked)

    props.onCheckedChange(checked, props.token)
  }

  const listClassnames = clsx({ done: isChecked })

  async function handleDoubleClick() {
    centerPlayerOnToken(props.token.id)
  }

  async function handleClick() {
    selectToken(props.token.id)
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
        src={props.token.imageUrl}
        alt={`Token image of ${props.token.name}`}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        onMouseEnter={() => {
          setMouseOverToken(true)
        }}
        onMouseLeave={() => {
          setMouseOverToken(false)
        }}
        style={
          isMouseOverToken && playerOwner?.color
            ? { boxShadow: `0px 0px 10px ${playerOwner.color}` }
            : {}
        }
      />
      <span>{props.token.name}</span>
      <input
        checked={isChecked}
        disabled={!hasModifyPermissions}
        className={clsx({ disabled: !hasModifyPermissions })}
        onChange={() => {
          if (!hasModifyPermissions) return
          handleCheckboxChange()
        }}
        type={'checkbox'}
        id={props.token.id}
      />
      <label
        title={isChecked ? 'Reset turn' : 'Finish turn'}
        className={clsx({ disabled: !hasModifyPermissions })}
        htmlFor={props.token.id}
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
              stroke-width='2'
              stroke-linecap='round'
              stroke-linejoin='round'
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
              stroke-width='2'
              stroke-linecap='round'
              stroke-linejoin='round'
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
