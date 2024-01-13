import { useEffect, useState } from 'react'
import clsx from 'clsx'

import { Token } from '../../../obr/tokens.ts'
import {
  PlayerRole,
  PlayerState,
  centerPlayerOnTokens,
  selectTokens,
} from '../../../obr/player.ts'
import MetaData from '../../../obr/metadata.ts'
import { PartyState } from '../../../obr/party.ts'
import { PermissionState } from '../../../obr/permissions.ts'
import { ThemeState } from '../../../obr/theme.ts'

const InitiativeListItem = (props: {
  groupId: string
  tokens: Token[]
  playerState: PlayerState
  partyState: PartyState
  permissionState: PermissionState
  themeState: ThemeState
  onCheckedChange: (hasTurn: boolean, groupId: string) => void
}) => {
  const [hasTurn, setHasTurn] = useState(false)
  const [turnCount, setTurnCount] = useState(1)
  const [isMouseOverToken, setMouseOverToken] = useState(false)
  const [currentTokens, setCurrentTokens] = useState<Token[]>(props.tokens)
  const [optionsOpen, setOptionsOpen] = useState(false)

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
    // If a token is added to the group update it so that it matched the checked state
    if (currentTokens.length < props.tokens.length) {
      const currentTokenIds = new Set<string>()
      for (const token of currentTokens) {
        currentTokenIds.add(token.id)
      }

      const newTokens: Token[] = []
      for (const token of props.tokens) {
        if (!currentTokenIds.has(token.id)) {
          newTokens.push(token)
        }
      }

      setCurrentTokens(props.tokens)

      MetaData.setTurnMetadataFromTokens(newTokens, hasTurn)
    }
    // If a token in the state was updated ensure that the checked state matches
    else if (currentTokens.length === props.tokens.length) {
      const changedTokens = props.tokens.filter(
        token => token.hasTurn !== hasTurn,
      )

      if (changedTokens.length != props.tokens.length) {
        setHasTurn(!hasTurn)
      }
    } else {
      setCurrentTokens(props.tokens)
    }
  }, [props.tokens])

  // useEffect(() => {
  //   // If a token in the state was updated ensure that the checked state matches
  //   const unchangedTokens = props.tokens.filter(
  //     token => token.hasTurn != hasTurn,
  //   )

  //   MetaData.setTurnMetadataFromTokens(unchangedTokens, hasTurn)
  // }, [hasTurn])

  const handleCheckboxChange = () => {
    const checked = !hasTurn
    setHasTurn(checked)
    MetaData.setTurnMetadataFromTokens(currentTokens, checked)
    props.onCheckedChange(checked, props.groupId)
  }

  async function handleDoubleClick() {
    centerPlayerOnTokens(props.tokens)
  }

  async function handleClick() {
    selectTokens(props.tokens)
  }

  const listClassnames = clsx({ done: !hasTurn })

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
        checked={!hasTurn}
        disabled={!hasModifyPermissions}
        className={clsx({ disabled: !hasModifyPermissions })}
        onChange={() => {
          if (hasModifyPermissions) {
            handleCheckboxChange()
          }
        }}
        type={'checkbox'}
        id={props.groupId}
      />
      <label
        title={!hasTurn ? 'Reset turn' : 'Finish turn'}
        className={clsx({ disabled: !hasModifyPermissions })}
        htmlFor={props.groupId}
        role={'application'}
      >
        {!hasTurn ? (
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
          <svg
            width='15'
            height='15'
            viewBox='0 0 24 24'
            fill={
              isOwner
                ? props.themeState.primary.dark
                : props.themeState.text.primary
            }
            xmlns='http://www.w3.org/2000/svg'
          >
            <path
              d='M5 21V3.90002C5 3.90002 5.875 3 8.5 3C11.125 3 12.875 4.8 15.5 4.8C18.125 4.8 19 3.9 19 3.9V14.7C19 14.7 18.125 15.6 15.5 15.6C12.875 15.6 11.125 13.8 8.5 13.8C5.875 13.8 5 14.7 5 14.7'
              stroke={
                isOwner
                  ? props.themeState.primary.dark
                  : props.themeState.text.primary
              }
              strokeWidth='2'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
            <text
              x='50%'
              y='50%'
              dominant-baseline='middle'
              textAnchor='middle'
              fontSize={32}
              fill={
                isOwner
                  ? props.themeState.text.primary
                  : props.themeState.text.primary
              }
            >
              {turnCount > 1 ? turnCount : ''}
            </text>
          </svg>
        )}
      </label>

      <button
        title={'More options'}
        style={{ border: 'none', cursor: 'pointer' }}
        onClick={() => {
          setOptionsOpen(true)
        }}
      >
        <svg
          width='15'
          height='15'
          viewBox='0 0 32 32'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path
            d='M19 16a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3zm0 13a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3zm0-26a3 3 0 0 1-3 3 3 3 0 0 1-3-3 3 3 0 0 1 3-3 3 3 0 0 1 3 3z'
            fill={props.themeState.text.secondary}
          />
        </svg>
      </button>
    </li>
  )
}

export default InitiativeListItem
