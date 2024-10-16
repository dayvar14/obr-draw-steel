import React, { useEffect } from 'react'
import SelectIcon from '@icons/select.svg?react'
import DeleteIcon from '@icons/delete.svg?react'
import PlusIcon from '@icons/plus_circle.svg?react'
import MinusIcon from '@icons/minus_circle.svg?react'
import { Player, Group } from '@obr'
import { SettingsContext } from 'context/SettingsContext'
import { GroupContext } from 'context/GroupContext'
import clsx from 'clsx'

export const GroupOptionsList: React.FC<{
  subGroupId: string
  groupType: Group.GroupType
  onClickButton: () => void
}> = ({ subGroupId, groupType, onClickButton }) => {
  const [splitCount, setSplitCount] = React.useState<number>(0)
  const settingsContext = React.useContext(SettingsContext)
  const groupContext = React.useContext(GroupContext)
  const [maxTurnCount, setMaxTurnCount] = React.useState(1)

  if (!settingsContext || !groupContext) {
    return null
  }

  const subGroup =
    groupContext.groupMetadata.groupsByType[groupType].subGroupsById[subGroupId]

  useEffect(() => {
    setMaxTurnCount(subGroup?.maxTurns ?? 1)
  }, [])

  if (!subGroup) {
    return <></>
  }

  const tokens = Object.values(subGroup?.tokensById)

  if (!tokens) {
    return <></>
  }

  const MAX_TURN_COUNT = 5

  useEffect(() => {
    setSplitCount(tokens.length > 5 ? 5 : 1)
  }, [subGroup])

  const handleNumberChange = (
    setFunction: (value: number) => void,
    min: number,
    max: number,
  ) => {
    const handleNumberChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = parseInt(event.target.value, 10)

      if (!inputValue) {
        setFunction(min)
      }

      const value = Math.min(Math.max(inputValue, min), max)
      setFunction(value)
    }

    return handleNumberChange
  }

  const onClickDelete = async () => {
    Player.deleteTokens(tokens)
    onClickButton()
  }

  const onClickSelect = async () => {
    Player.centerPlayerOnTokens(tokens)
    onClickButton()
  }

  return (
    <div className={'options-container group'}>
      <button className='option option-button' onClick={onClickSelect}>
        <div className='option-button-icon-container'>
          <SelectIcon className='large filled' />
        </div>
        <p>Select {tokens.length > 1 ? 'Group' : 'Character'}</p>
      </button>
      <button className='option option-button' onClick={onClickDelete}>
        <div className='option-button-icon-container'>
          <DeleteIcon className='large filled colored' />
        </div>
        <p>Delete {tokens.length > 1 ? 'Group' : 'Character'}</p>
      </button>
      <div className={'options'}>
        <div className='option'>Set Turns</div>
        <div className='sub-option'>
          <button
            className={clsx('sub-option-icon-button', {
              disabled: maxTurnCount == 1,
            })}
            disabled={maxTurnCount == 1}
            onClick={() => {
              const newTurnCount = Math.max(maxTurnCount - 1, 1)
              setMaxTurnCount(newTurnCount)
            }}
          >
            <MinusIcon className='medium filled' />
          </button>
          <input
            className='sub-option-input'
            type='number'
            min='1'
            max='999'
            value={maxTurnCount}
            onChange={() => {
              handleNumberChange(setMaxTurnCount, 1, MAX_TURN_COUNT)
            }}
          />
          <button
            className={clsx([
              'sub-option-icon-button',
              {
                disabled: maxTurnCount == MAX_TURN_COUNT,
              },
            ])}
            disabled={maxTurnCount == MAX_TURN_COUNT}
            onClick={() => {
              const newTurnCount = Math.min(maxTurnCount + 1, MAX_TURN_COUNT)
              setMaxTurnCount(newTurnCount)
            }}
          >
            <PlusIcon className='medium filled' />
          </button>
          <button
            className='sub-option-button'
            onClick={() => {
              const groupMetadata = groupContext.groupMetadata
              groupMetadata.groupsByType[groupType].subGroupsById[
                subGroup.subGroupId
              ].maxTurns = maxTurnCount
              groupMetadata.groupsByType[groupType].subGroupsById[
                subGroup.subGroupId
              ].currentTurn = 0

              Group.updateGroupMetadata(groupMetadata)
              onClickButton()
            }}
          >
            Set
          </button>
        </div>
        <div className='option'>Group Splitting</div>
        <div className='sub-option'>
          <button
            className={clsx([
              'sub-option-icon-button',
              {
                disabled: splitCount == 1,
              },
            ])}
            disabled={splitCount == 1}
            onClick={() => {
              const newSplitCount = Math.max(splitCount - 1, 1)
              setSplitCount(newSplitCount)
            }}
          >
            <MinusIcon className='medium filled' />
          </button>
          <input
            className={clsx([
              'sub-option-input',
              { disabled: tokens.length == 1 },
            ])}
            disabled={tokens.length == 1}
            type='number'
            min='1'
            max='999'
            value={splitCount}
            onChange={handleNumberChange(setSplitCount, 1, tokens.length)}
          />

          <button
            className={clsx([
              'sub-option-icon-button',
              {
                disabled: splitCount >= tokens.length,
              },
            ])}
            disabled={splitCount >= tokens.length}
            onClick={() => {
              const newSplitCount = Math.min(splitCount + 1, tokens.length)
              setSplitCount(newSplitCount)
            }}
          >
            <PlusIcon className='medium filled' />
          </button>
          <button
            disabled={tokens.length == 1 || splitCount >= tokens.length}
            className={clsx(['sub-option-button'], {
              disabled: tokens.length == 1 || splitCount >= tokens.length,
            })}
            onClick={() => {
              Group.splitSubgroup(
                subGroup,
                splitCount,
                settingsContext.settings.grouping.groupSplittingMode,
              )
              onClickButton()
            }}
          >
            Split
          </button>
        </div>
      </div>
    </div>
  )
}
