import clsx from 'clsx'
import { Group, Player, Token } from '@obr'

import { useContext, useState } from 'react'

import { PLACE_HOLDER_TOKEN_IMAGE } from 'config'
import DownRightArrowIcon from '@icons/down_right_arrow.svg?react'
import DownRightArrowWithLineIcon from '@icons/down_right_arrow_with_line.svg?react'
import HamburgerMenuDotsIcon from '@icons/hamburger_menu_dots.svg?react'
import EyeClosedIcon from '@icons/eye_closed.svg?react'
import { PopoverOptions } from '@components/Popovers/Popover'
import { TokenOptionsList } from '@components/OptionsList/TokenOptionsList'
import { SettingsContext } from 'context/SettingsContext'
import { GroupContext } from 'context/GroupContext'
import { PlayerContext } from 'context/PlayerContext'
import { PermissionContext } from 'context/PermissionContext'
import lodash from 'lodash'

const InitiativeSubListSubItem: React.FC<{
  token: Token.Token
  subGroup: Group.SubGroup
  isLastItem: boolean
  hasTurn: boolean
  popover?: {
    openPopover?: (options: PopoverOptions) => void
    closePopover?: () => void
    isVisble?: boolean
  }
}> = ({ token, subGroup, isLastItem, popover, hasTurn }) => {
  const [, setMouseOverToken] = useState(false)
  const [imageSrc, setImageSrc] = useState<string>(token.imageUrl)
  const [isEditingName, setIsEditingName] = useState(false)
  const [newName, setNewName] = useState(
    token.plainTextName ? token.plainTextName : token.name,
  )
  const settingsContext = useContext(SettingsContext)
  const groupContext = useContext(GroupContext)
  const playerContext = useContext(PlayerContext)
  const permissionContext = useContext(PermissionContext)

  if (
    !settingsContext ||
    !groupContext ||
    !playerContext ||
    !permissionContext
  ) {
    throw new Error('Context is undefined')
  }
  const isOwnerOnly = permissionContext.permissionState.permissions.includes(
    'CHARACTER_OWNER_ONLY',
  )

  const isGM = playerContext.playerState.role === Player.PlayerRole.GM

  const isOwner = token.createdUserId === playerContext.playerState.id

  const canOpenAllOptions =
    settingsContext.settings.playerAccess.canOpenAllOptions
  const canOpenOptionsIfPlayerOwned =
    settingsContext.settings.playerAccess.canOpenOptionsIfPlayerOwned

  const canOpenOptions =
    isGM ||
    (isOwner && isOwnerOnly && canOpenOptionsIfPlayerOwned) ||
    canOpenAllOptions

  const handleNameChange = () => {
    const tokenCopy = lodash.cloneDeep(token)
    let newNameCopy = newName

    if (newNameCopy !== tokenCopy.name) {
      if (!newNameCopy) newNameCopy = token.name
      tokenCopy.plainTextName = newNameCopy
      Token.updateTokens([tokenCopy])
      setNewName(newNameCopy)
    }
    setIsEditingName(false)
  }

  return (
    <>
      <li
        className={clsx(['sub-list-sub-item'], {})}
        onDoubleClick={handleDoubleClick([token])}
      >
        <div
          className={clsx(['sub-list-sub-item-arrow', { 'no-turn': !hasTurn }])}
        >
          {isLastItem ? (
            <DownRightArrowIcon
              className={clsx(['colored disabled', { 'no-turn': !hasTurn }])}
            />
          ) : (
            <DownRightArrowWithLineIcon
              className={clsx(['colored disabled', { 'no-turn': !hasTurn }])}
            />
          )}
        </div>
        <div className={clsx(['sub-list-item-token', { 'no-turn': !hasTurn }])}>
          <img
            src={imageSrc}
            onError={() => setImageSrc(PLACE_HOLDER_TOKEN_IMAGE)}
            onClick={handleClick([token])}
            onMouseEnter={() => {
              setMouseOverToken(true)
            }}
            onMouseLeave={() => {
              setMouseOverToken(false)
            }}
          />
        </div>
        <div
          className={clsx(['sub-list-item-description'], {
            'no-turn': !hasTurn,
          })}
        >
          <div className={'sub-list-sub-item-name'}>
            {isEditingName && canOpenOptions ? (
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
                  if (canOpenOptions) {
                    setIsEditingName(true)
                  }
                }}
              >
                {newName}
              </span>
            )}
          </div>
          <div className='sub-list-sub-item-caption'>
            {!token.isVisible && <EyeClosedIcon className='colored medium' />}
          </div>
        </div>
        <div className={'sub-list-sub-item-icons'}>
          <button
            id={token.id + '-options'}
            title={'More options'}
            className={clsx([
              'rounded-square-icon-button',
              {
                disabled: !canOpenOptions,
                'no-turn': !canOpenOptions,
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
                      token.id + '-options',
                    ) as HTMLElement,
                  },
                  content: (
                    <SettingsContext.Provider value={settingsContext}>
                      <GroupContext.Provider value={groupContext}>
                        <TokenOptionsList
                          tokenId={token.id}
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
                  height: 100,
                })
              }
            }}
          >
            <HamburgerMenuDotsIcon className='colored filled medium' />
          </button>
        </div>
      </li>
    </>
  )
}

export default InitiativeSubListSubItem

const handleDoubleClick = (tokens: Token.Token[]) => async () => {
  Player.centerPlayerOnTokens(tokens)
}

const handleClick =
  (tokens: Token.Token[]) => (event: React.MouseEvent<HTMLDivElement>) => {
    Player.selectTokens(tokens, event.shiftKey)
  }
