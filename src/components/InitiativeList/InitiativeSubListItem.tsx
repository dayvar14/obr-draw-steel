import clsx from 'clsx'
import { Group, Player, Token } from '@obr'
import { PartyContext } from 'context/PartyContext'
import { PermissionContext } from 'context/PermissionContext'
import { PlayerContext } from 'context/PlayerContext'

import { useContext, useEffect, useState } from 'react'

import FlagFilledIcon from '@icons/flag_filled.svg?react'
import FlagUnfilledIcon from '@icons/flag_unfilled.svg?react'
import ReactionFilledIcon from '@icons/reaction_filled.svg?react'
import ReactionUnfilledIcon from '@icons/reaction_unfilled.svg?react'
import HamburgerMenuDotsIcon from '@icons/hamburger_menu_dots.svg?react'
import EyeClosedIcon from '@icons/eye_closed.svg?react'
import ChevronRightIcon from '@icons/chevron_right.svg?react'
import DownLineIcon from '@icons/down_line.svg?react'
import { PLACE_HOLDER_TOKEN_IMAGE } from 'config'
import { SettingsContext } from 'context/SettingsContext'
import InitiativeSubListSubItem from './InitiativeSubListSubItem'
import { PopoverOptions } from '@components/Popovers/Popover'
import { GroupOptionsList } from '@components/OptionsList/GroupOptionsList'
import { GroupContext } from 'context/GroupContext'
import lodash from 'lodash'

const InitiativeSubListItem: React.FC<{
  subGroup: Group.SubGroup
  onTurnChange?: () => void
  onReactionChange?: () => void
  onDragStart?: (event: React.DragEvent<HTMLLIElement>) => void
  onDragEnd?: (event: React.DragEvent<HTMLLIElement>) => void
  popover?: {
    openPopover?: (options: PopoverOptions) => void
    closePopover?: () => void
    isVisble?: boolean
  }
}> = ({
  subGroup,
  onTurnChange,
  onReactionChange,
  onDragStart,
  onDragEnd,
  popover,
}) => {
  const permissionContext = useContext(PermissionContext)
  const playerContext = useContext(PlayerContext)
  const partyContext = useContext(PartyContext)
  const settingsContext = useContext(SettingsContext)
  const groupContext = useContext(GroupContext)
  const tokens = Object.values(subGroup.tokensById)
  const [, setMouseOverToken] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>(tokens[0].imageUrl)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState(subGroup.subGroupName)

  if (
    !playerContext ||
    !permissionContext ||
    !partyContext ||
    !settingsContext ||
    !groupContext
  ) {
    throw new Error(
      'PlayerContext, PermissionContext, PartyContext, or SettingsContext is undefined',
    )
  }

  const isOwnerOnly = permissionContext.permissionState.permissions.includes(
    'CHARACTER_OWNER_ONLY',
  )

  const isGM = playerContext.playerState.role === Player.PlayerRole.GM
  const hasTurn = subGroup.currentTurn < subGroup.maxTurns
  const hasReaction = subGroup.currentReaction < subGroup.maxReactions

  const ownerIds = new Set<string>()
  for (const token of tokens) {
    ownerIds.add(token.createdUserId)
  }

  const isOwner =
    ownerIds.has(playerContext.playerState.id) && ownerIds.size === 1

  const canOpenAllOptions =
    settingsContext.settings.playerAccess.canOpenAllOptions
  const canOpenOptionsIfPlayerOwned =
    settingsContext.settings.playerAccess.canOpenOptionsIfPlayerOwned
  // if players can only update their own tokens, then check to make sure they are the owner. Otherwise the player cannot modify

  const canAdjustFlags = isGM || (isOwner && isOwnerOnly) || canOpenAllOptions
  const canOpenOptions =
    isGM ||
    (isOwner && isOwnerOnly && canOpenOptionsIfPlayerOwned) ||
    canOpenAllOptions

  const playerOwners: Player.PlayerState[] = []
  const visibleTokensCount = tokens.filter(token => token.isVisible).length

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
    if (tokens.length === 1) setIsExpanded(false)
  }, [tokens])

  const handleNameChange = async () => {
    let newNameCopy = newName
    const subGroupCopy = lodash.cloneDeep(subGroup)

    if (newNameCopy !== subGroup.subGroupName) {
      if (!newNameCopy) newNameCopy = tokens[0].name
      subGroupCopy.subGroupName = newNameCopy
      await Group.updateSubgroupByGroupType(subGroup.groupType, subGroupCopy)
      setNewName(newNameCopy)
    }
    setIsEditingName(false)
  }

  return (
    <>
      <li
        className={clsx(['sub-list-item'], {
          hidden: !subGroup.isVisible && !isGM,
        })}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDoubleClick={handleDoubleClick(tokens)}
      >
        <button
          className={clsx([
            'rounded-square-icon-button small oval sub-list-item-expand',
            { hidden: tokens.length === 1 },
          ])}
          onClick={() => {
            setIsExpanded(!isExpanded)
          }}
        >
          <ChevronRightIcon
            className={clsx([
              'colored medium disabled sub-list-item-expand',
              {
                open: isExpanded,
              },
            ])}
            style={{ width: '100%', height: '100%' }}
          />
        </button>
        <div className={clsx(['sub-list-item-token', { 'no-turn': !hasTurn }])}>
          <img
            src={imageSrc}
            onError={() => setImageSrc(PLACE_HOLDER_TOKEN_IMAGE)}
            onClick={handleClick(tokens)}
            onMouseEnter={() => {
              setMouseOverToken(true)
            }}
            onMouseLeave={() => {
              setMouseOverToken(false)
            }}
          />
        </div>
        {isExpanded && (
          <div className={'sub-list-item-down-line'}>
            <DownLineIcon
              className={clsx(['colored disabled', { 'no-turn': !hasTurn }])}
            />
          </div>
        )}
        <div
          className={clsx(['sub-list-item-description'], {
            'no-turn': !hasTurn,
          })}
        >
          <div className={'sub-list-item-name'}>
            {isEditingName ? (
              <input
                type='text'
                className='align-left'
                value={newName}
                onChange={e => setNewName(e.target.value)}
                onBlur={handleNameChange}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    handleNameChange()
                  }
                }}
                autoFocus
              />
            ) : (
              <span
                className={clsx({ editable: canOpenOptions })}
                onClick={() => {
                  if (canOpenOptions) setIsEditingName(true)
                }}
              >
                {subGroup.subGroupName}
              </span>
            )}
          </div>
          {(tokens.length > 1 || !subGroup.isVisible) && (
            <div className='sub-list-item-caption'>
              {tokens.length > 1 && (visibleTokensCount > 1 || isGM) && (
                <p>x{isGM ? tokens.length : visibleTokensCount}</p>
              )}
              {!subGroup.isVisible && (
                <EyeClosedIcon className='colored medium' />
              )}
            </div>
          )}
        </div>
        <div className={'sub-list-item-icons'}>
          <input
            checked={!hasTurn}
            disabled={!canAdjustFlags}
            className={clsx({
              disabled: !canAdjustFlags,
              'no-turn': !hasTurn,
              'no-input': !canOpenAllOptions,
            })}
            onChange={() => {
              if (canAdjustFlags && onTurnChange) onTurnChange()
            }}
            type={'checkbox'}
            id={subGroup.subGroupId + '-flag'}
          />
          <label
            title={!hasTurn ? 'Reset turn' : 'Finish turn'}
            className={clsx({
              disabled: !canAdjustFlags,
              'no-turn': !hasTurn,
              'no-input': !canOpenAllOptions,
            })}
            htmlFor={subGroup.subGroupId + '-flag'}
            role={'application'}
          >
            {(settingsContext.settings.playerAccess.canSeeTurnCount || isGM) &&
              subGroup.maxTurns > 1 && (
                <span>{subGroup.maxTurns - subGroup.currentTurn}</span>
              )}
            {hasTurn && (
              <FlagFilledIcon
                className={clsx([
                  'colored medium filled',
                  { contrast: !canAdjustFlags, primary: canAdjustFlags },
                ])}
              />
            )}
            {!hasTurn && (
              <FlagUnfilledIcon
                className={clsx([
                  'colored medium',
                  { contrast: !canAdjustFlags, primary: canAdjustFlags },
                ])}
              />
            )}
          </label>
          {settingsContext.settings.main?.reactionsEnabled && (
            <>
              <input
                checked={!hasReaction}
                disabled={!canAdjustFlags}
                className={clsx({
                  disabled: !canAdjustFlags,
                  'no-turn': !hasReaction,
                  'no-input': !canOpenAllOptions,
                })}
                onChange={() => {
                  if (canAdjustFlags && onReactionChange) onReactionChange()
                }}
                type={'checkbox'}
                id={subGroup.subGroupId + '-reaction'}
              />
              <label
                title={!hasReaction ? 'Reset reaction' : 'Finish reaction'}
                className={clsx({
                  disabled: !canAdjustFlags,
                  'no-turn': !hasReaction,
                  'no-input': !canOpenAllOptions,
                })}
                htmlFor={subGroup.subGroupId + '-reaction'}
                role={'application'}
              >
                {hasReaction ? (
                  <ReactionFilledIcon
                    className={clsx([
                      'filled colored medium',
                      { contrast: !canAdjustFlags, primary: canAdjustFlags },
                    ])}
                  />
                ) : (
                  <ReactionUnfilledIcon
                    className={clsx([
                      'colored medium',
                      { contrast: !canAdjustFlags, primary: canAdjustFlags },
                    ])}
                  />
                )}
              </label>
            </>
          )}

          <button
            id={subGroup.subGroupId + '-options'}
            title={'More options'}
            className={clsx([
              'rounded-square-icon-button',
              {
                disabled: !canOpenOptions,
                'no-turn': !canOpenOptions,
                'no-input': !canOpenAllOptions,
              },
            ])}
            disabled={!canOpenOptions}
            onClick={() => {
              if (!popover?.openPopover) return
              if (popover?.isVisble) {
                popover.closePopover && popover.closePopover()
              } else {
                popover.openPopover({
                  triggerRef: {
                    current: document.getElementById(
                      subGroup.subGroupId + '-options',
                    ) as HTMLElement,
                  },
                  content: (
                    <SettingsContext.Provider value={settingsContext}>
                      <GroupContext.Provider value={groupContext}>
                        <GroupOptionsList
                          subGroupId={subGroup.subGroupId}
                          groupType={subGroup.groupType}
                          onClickButton={
                            popover.closePopover
                              ? popover.closePopover
                              : () => {}
                          }
                        />
                      </GroupContext.Provider>
                    </SettingsContext.Provider>
                  ),
                  width: 200,
                  height: 262,
                })
              }
            }}
          >
            <HamburgerMenuDotsIcon className='colored filled medium' />
          </button>
        </div>
      </li>
      {isExpanded && (
        <>
          {isGM
            ? getSubItems(subGroup, tokens, popover)
            : getSubItems(
                subGroup,
                tokens.filter(value => value.isVisible),
                popover,
              )}
        </>
      )}
    </>
  )
}

export default InitiativeSubListItem

const handleDoubleClick = (tokens: Token.Token[]) => async () => {
  Player.centerPlayerOnTokens(tokens)
}

const handleClick =
  (tokens: Token.Token[]) => (event: React.MouseEvent<HTMLDivElement>) => {
    Player.selectTokens(tokens, event.shiftKey)
  }

const getSubItems = (
  subGroup: Group.SubGroup,
  tokens: Token.Token[],
  popover?: {
    openPopover?: (options: PopoverOptions) => void
    closePopover?: () => void
  },
) => {
  let elements: JSX.Element[] = []

  for (let i = 0; i < tokens.length; i++) {
    elements.push(
      <InitiativeSubListSubItem
        key={tokens[i].id}
        hasTurn={subGroup.currentTurn < subGroup.maxTurns}
        token={tokens[i]}
        subGroup={subGroup}
        isLastItem={i === tokens.length - 1}
        popover={popover}
      />,
    )
  }
  return elements
}
