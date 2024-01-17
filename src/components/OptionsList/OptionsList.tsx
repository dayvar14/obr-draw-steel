import React, { useEffect } from 'react'
import SelectIcon from '@icons/select.svg?react'
import DeleteIcon from '@icons/delete.svg?react'
import PlusIcon from '@icons/plus_circle.svg?react'
import MinusIcon from '@icons/minus_circle.svg?react'
import { Player, Token, Popover } from '@obr'
import { TOKEN_OPTIONS_POPOVER_ID } from 'config'

export const OptionsList: React.FC<{ groupId: string }> = ({ groupId }) => {
  const [tokens, setTokens] = React.useState<Token.Token[] | undefined>([])
  const [turnCount, setTurnCount] = React.useState(1)
  const [splitCount, setSplitCount] = React.useState(5)

  useEffect(() => {
    const getTokens = async () => {
      const tokens = await Token.getTokensFromGroupId(groupId)
      setTokens(tokens)
      setSplitCount(Math.min(tokens.length, 5))
    }

    getTokens()
  })

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
        <p>Select Character</p>
      </button>
      <button className='option option-button' onClick={onClickDelete}>
        <div className='option-button-icon-container'>
          <DeleteIcon className='large filled colored' />
        </div>
        <p>Delete Character</p>
      </button>
      <p className='options-header'>Token Options</p>
      <div className={'options'}>
        <div className='option'>Set Turns</div>
        <div className='sub-option'>
          <button
            className='sub-option-icon-button'
            onClick={() => {
              setTurnCount(turnCount - 1)
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
            onChange={crateHandleNumberChangeFun(setTurnCount, 1, 10)}
          />
          <button
            className='sub-option-icon-button'
            onClick={() => {
              setTurnCount(turnCount + 1)
            }}
          >
            <PlusIcon className='medium filled' />
          </button>
          <button className='sub-option-button'>Set</button>
        </div>
        <div className='option'>Group Splitting</div>
        <div className='sub-option'>
          <button
            className='sub-option-icon-button'
            onClick={() => {
              setSplitCount(splitCount - 1)
            }}
          >
            <MinusIcon className='medium filled' />
          </button>
          <input
            className='sub-option-input'
            type='number'
            min='1'
            max='999'
            value={splitCount}
            onChange={crateHandleNumberChangeFun(setSplitCount, 1, 10)}
          />

          <button className='sub-option-icon-button'>
            <PlusIcon
              className='medium filled'
              onClick={() => {
                setSplitCount(splitCount + 1)
              }}
            />
          </button>
          <button className='sub-option-button'>Split</button>
        </div>
      </div>
    </>
  )
}
