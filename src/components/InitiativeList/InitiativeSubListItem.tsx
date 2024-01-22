import clsx from 'clsx'
import { Metadata, Player, Token, Popover } from '@obr'
import { PartyContext } from 'context/PartyContext'
import { PermissionContext } from 'context/PermissionContext'
import { PlayerContext } from 'context/PlayerContext'

import { useContext, useEffect, useState } from 'react'

import FlagFilledIcon from '@icons/flag_filled.svg?react'
import FlagUnfilledIcon from '@icons/flag_unfilled.svg?react'
import HamburgerMenuDotsIcon from '@icons/hamburger_menu_dots.svg?react'
import EyeClosedIcon from '@icons/eye_closed.svg?react'
import { PLACE_HOLDER_TOKEN_IMAGE } from 'config'

const InitiativeSubListItem: React.FC<{
  groupId: string
  tokens: Token.Token[]
  onCheckedChange: (hasTurn: boolean, groupId: string) => void
  onDragStart?: (event: React.DragEvent<HTMLLIElement>) => void
  onDragEnd?: (event: React.DragEvent<HTMLLIElement>) => void
}> = ({ groupId, tokens, onCheckedChange, onDragStart, onDragEnd }) => {
  const permissionContext = useContext(PermissionContext)
  const playerContext = useContext(PlayerContext)
  const partyContext = useContext(PartyContext)
  const [imageSrc, setImageSrc] = useState<string>(tokens[0].imageUrl)

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

  let isVisible = false
  let visibleCount = 0

  for (const token of tokens) {
    if (token.isVisible) {
      isVisible = true
      visibleCount++
    }
  }

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

  const handleImageError = () => {
    // Replace with the path of your replacement image
    setImageSrc(PLACE_HOLDER_TOKEN_IMAGE)
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

  async function handleClick(event: React.MouseEvent<HTMLDivElement>) {
    Player.selectTokens(tokens, event.shiftKey)
  }

  return (
    <li
      className={clsx(['sub-list-item'], { hidden: !isVisible && !isGM })}
      draggable={true}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className={clsx(['sub-list-item-token', { 'no-turn': !hasTurn }])}>
        <img
          src={imageSrc}
          onError={handleImageError}
          onClick={(event: React.MouseEvent<HTMLDivElement>) => {
            handleClick(event)
          }}
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
      <div
        className={clsx(['sub-list-item-description'], { 'no-turn': !hasTurn })}
      >
        <div className={'sub-list-item-name'}>{tokens[0].name}</div>
        {(tokens.length > 1 || !isVisible) && (
          <div className='sub-list-item-caption'>
            {tokens.length > 1 && (visibleCount > 1 || isGM) && (
              <p>x{isGM ? tokens.length : visibleCount}</p>
            )}
            {!isVisible && <EyeClosedIcon className='colored medium' />}
          </div>
        )}
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
          id={groupId + '-flag'}
        />
        <label
          title={!hasTurn ? 'Reset turn' : 'Finish turn'}
          className={clsx({
            disabled: !hasModifyPermissions,
            'no-turn': !hasTurn,
          })}
          htmlFor={groupId + '-flag'}
          role={'application'}
        >
          {hasTurn ? (
            <FlagFilledIcon
              className={clsx('filled colored medium', {
                primary: isOwner,
              })}
            />
          ) : (
            <FlagUnfilledIcon
              className={clsx('colored medium', {
                primary: isOwner,
              })}
            />
          )}
        </label>

        <button
          id={groupId + '-options'}
          title={'More options'}
          className={clsx([
            'rounded-square-icon-button',
            {
              'no-turn': !hasTurn,
            },
          ])}
          onClick={(event: React.MouseEvent<HTMLButtonElement>) => {
            const zoomRatio = Math.round(window.devicePixelRatio * 100) / 200
            // Adjust event coordinates based on the zoom level

            const userAgent = navigator.userAgent

            let top = 0
            let left = 0

            if (userAgent.includes('Firefox')) {
              // Firefix screen X/Y are already adjusted for zoom
              left = event.screenX
              top = event.screenY - 100 / zoomRatio
            } else {
              left = event.screenX / zoomRatio
              top = (event.screenY - 100) / zoomRatio
            }

            Popover.openTokenOptions(groupId, {
              top,
              left,
            })
          }}
        >
          <HamburgerMenuDotsIcon className='colored filled medium' />
        </button>
      </div>
    </li>
  )
}

export default InitiativeSubListItem
