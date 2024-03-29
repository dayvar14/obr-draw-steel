import clsx from 'clsx'
import { Metadata, Player, Token } from '@obr'
import { PermissionContext } from 'context/PermissionContext'
import { PlayerContext } from 'context/PlayerContext'
import { useContext, useEffect, useState } from 'react'

import FlagFilledIcon from '@icons/flag_filled.svg?react'
import FlagUnfilledIcon from '@icons/flag_unfilled.svg?react'
import HamburgerMenuDotsIcon from '@icons/hamburger_menu_dots.svg?react'
import { PartyContext } from 'context/PartyContext'

const InitiativeSubListItem: React.FC<{
  groupId: string
  tokens: Token.Token[]
  onCheckedChange: (hasTurn: boolean, groupId: string) => void
}> = ({ groupId, tokens, onCheckedChange }) => {
  const permissionContext = useContext(PermissionContext)
  const playerContext = useContext(PlayerContext)
  const partyContext = useContext(PartyContext)

  if (!playerContext || !permissionContext || !partyContext) {
    throw new Error(
      'PlayerContext, PermissionContext, or PartyContext is undefined',
    )
  }

  const [hasTurn, setHasTurn] = useState(false)
  const [isMouseOverToken, setMouseOverToken] = useState(false)
  const [currentTokens, setCurrentTokens] = useState<Token.Token[]>(tokens)
  const isOwnerOnly = permissionContext.permissionState.permissions.includes(
    'CHARACTER_OWNER_ONLY',
  )

  const isGM = playerContext.playerState.role === Player.PlayerRole.GM

  const ownerIds = new Set<string>()
  for (const token of tokens) {
    ownerIds.add(token.createdUserId)
  }

  const isOwner = ownerIds.has(playerContext.playerState.id)

  const hasModifyPermissions = isGM || !isOwnerOnly || (isOwnerOnly && isOwner)

  const playerOwners: Player.PlayerState[] = []

  if (
    !isOwner &&
    partyContext.partyState &&
    partyContext.partyState.playerStates
  ) {
    for (const playerState of partyContext.partyState.playerStates) {
      if (ownerIds.has(playerState.id)) {
        playerOwners.push(playerState)
      }
    }
  }

  useEffect(() => {
    // If a token is added to the group update it so that it matched the checked state
    if (currentTokens.length < tokens.length) {
      const currentTokenIds = new Set<string>()
      for (const token of currentTokens) {
        currentTokenIds.add(token.id)
      }

      const newTokens: Token.Token[] = []
      for (const token of tokens) {
        if (!currentTokenIds.has(token.id)) {
          newTokens.push(token)
        }
      }

      setCurrentTokens(tokens)

      Metadata.setTurnMetadataFromTokens(newTokens, hasTurn)
    }
    // If a token in the state was updated ensure that the checked state matches
    else if (currentTokens.length === tokens.length) {
      const changedTokens = tokens.filter(token => token.hasTurn !== hasTurn)

      if (changedTokens.length != tokens.length) {
        setHasTurn(!hasTurn)
      }
    } else {
      setCurrentTokens(tokens)
    }
  }, [tokens])

  const handleCheckboxChange = () => {
    const checked = !hasTurn
    setHasTurn(checked)
    Metadata.setTurnMetadataFromTokens(currentTokens, checked)
    onCheckedChange(checked, groupId)
  }

  async function handleDoubleClick() {
    Player.centerPlayerOnTokens(tokens)
  }

  async function handleClick() {
    Player.selectTokens(tokens)
  }

  return (
    <li className={clsx(['sub-list-item'], {})}>
      <div className={clsx(['sub-list-item-token', { 'no-turn': !hasTurn }])}>
        <img
          src={tokens[0].imageUrl}
          alt={`Token image of ${tokens[0].name}`}
          onClick={handleClick}
          onDoubleClick={handleDoubleClick}
          onMouseEnter={() => {
            setMouseOverToken(true)
          }}
          onMouseLeave={() => {
            setMouseOverToken(false)
          }}
          style={
            isMouseOverToken && playerOwners[0]?.color
              ? { boxShadow: `0px 0px 10px ${playerOwners[0].color}` }
              : {}
          }
        />
      </div>
      <div className={clsx(['sub-list-item-name'], { 'no-turn': !hasTurn })}>
        <div>{tokens[0].name}</div>
        {tokens.length > 1 && <p>x{tokens.length}</p>}
      </div>
      <div className={'sub-list-item-icons'}>
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
          id={groupId}
        />
        <label
          title={!hasTurn ? 'Reset turn' : 'Finish turn'}
          className={clsx({
            disabled: !hasModifyPermissions,
            'no-turn': !hasTurn,
          })}
          htmlFor={groupId}
          role={'application'}
        >
          {hasTurn ? (
            <FlagFilledIcon
              className='colored filled medium'
              style={
                isOwner
                  ? {
                      fill: playerContext?.playerState.color,
                      stroke: playerContext?.playerState.color,
                    }
                  : {}
              }
            />
          ) : (
            <FlagUnfilledIcon
              className='colored medium'
              style={
                isOwner
                  ? {
                      stroke: playerContext?.playerState.color,
                    }
                  : {}
              }
            />
          )}
        </label>

        <button
          title={'More options'}
          className={clsx([
            'rounded-square-icon-button',
            {
              'no-turn': !hasTurn,
            },
          ])}
          onClick={() => {}}
        >
          <HamburgerMenuDotsIcon className='colored filled medium' />
        </button>
      </div>
    </li>
  )
}

export default InitiativeSubListItem
