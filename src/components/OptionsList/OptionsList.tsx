import React, { useEffect } from 'react'
import SelectIcon from '@icons/select.svg?react'
import DeleteIcon from '@icons/delete.svg?react'
import PlusIcon from '@icons/plus_circle.svg?react'
import MinusIcon from '@icons/minus_circle.svg?react'
import { Player, Token, Popover } from '@obr'
import { TOKEN_OPTIONS_POPOVER_ID } from 'config'
import clsx from 'clsx'

export const OptionsList: React.FC<{ groupId: string }> = ({ groupId }) => {
  const [tokens, setTokens] = React.useState<Token.Token[] | undefined>([])
  const [turnCount, setTurnCount] = React.useState(1)
  const [splitCount, setSplitCount] = React.useState(5)

  const MAX_TURN_COUNT = 3

  useEffect(() => {
    const getTokens = async () => {
      const tokens = await Token.getTokensFromGroupId(groupId)
      setTokens(tokens)

      // Chosen as wanting to split by 5 under 10 tokens is unlikely
      let defaultSplitCount = 0
      if (tokens.length <= 9) {
        defaultSplitCount = 1
      } else {
        defaultSplitCount = 5
      }

      setSplitCount(defaultSplitCount)
    }

    getTokens()
  }, [])

  if (!tokens || tokens.length === 0) {
    return null
  }

  const crateHandleNumberChangeFun = (
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
    Popover.closeTokenOptions(TOKEN_OPTIONS_POPOVER_ID)
  }

  const onClickSelect = async () => {
    Player.centerPlayerOnTokens(tokens)
    Popover.closeTokenOptions(TOKEN_OPTIONS_POPOVER_ID)
  }

  return (
    <>
      <p className='options-header'>Actions</p>
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
      <p className='options-header'>Token Options</p>
      <div className={'options'}>
        <div className='option'>Set Turns</div>
        <div className='sub-option'>
          <button
            className={clsx('sub-option-icon-button', {
              disabled: turnCount == 1,
            })}
            disabled={turnCount == 1}
            onClick={() => {
              const newTurnCount = Math.max(turnCount - 1, 1)
              setTurnCount(newTurnCount)
            }}
          >
            <MinusIcon className='medium filled' />
          </button>
          <input
            className='sub-option-input'
            type='number'
            min='1'
            max='999'
            value={turnCount}
            onChange={crateHandleNumberChangeFun(
              setTurnCount,
              1,
              MAX_TURN_COUNT,
            )}
          />
          <button
            className={clsx([
              'sub-option-icon-button',
              {
                disabled: turnCount == MAX_TURN_COUNT,
              },
            ])}
            disabled={turnCount == MAX_TURN_COUNT}
            onClick={() => {
              const newTurnCount = Math.min(turnCount + 1, MAX_TURN_COUNT)
              setTurnCount(newTurnCount)
            }}
          >
            <PlusIcon className='medium filled' />
          </button>
          <button className='sub-option-button'>Set</button>
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
            onChange={crateHandleNumberChangeFun(
              setSplitCount,
              1,
              tokens.length,
            )}
          />

          <button
            className={clsx([
              'sub-option-icon-button',
              {
                disabled: splitCount == tokens.length,
              },
            ])}
            disabled={splitCount == tokens.length}
            onClick={() => {
              const newSplitCount = Math.min(splitCount + 1, tokens.length)
              setSplitCount(newSplitCount)
            }}
          >
            <PlusIcon className='medium filled' />
          </button>
          <button
            disabled={tokens.length == 1 || splitCount == tokens.length}
            className={clsx(['sub-option-button'], {
              disabled: tokens.length == 1 || splitCount == tokens.length,
            })}
            onClick={() => {
              Token.splitTokenGroups(groupId, splitCount)
            }}
          >
            Split
          </button>
        </div>
      </div>
    </>
  )
}
