import { useContext } from 'react'
import SelectIcon from '@icons/select.svg?react'
import DeleteIcon from '@icons/delete.svg?react'
import { Player } from '@obr'
import { TokenContext } from 'context/TokenContext'

export const TokenOptionsList: React.FC<{
  tokenId: string
  onClickButton: () => void
}> = ({ tokenId, onClickButton }) => {
  const tokenContext = useContext(TokenContext)
  const token = tokenContext?.tokensById[tokenId]

  if (!token) {
    return <></>
  }

  const onClickDelete = async () => {
    Player.deleteTokens([token])
    onClickButton()
  }

  const onClickSelect = async () => {
    Player.centerPlayerOnTokens([token])
    onClickButton()
  }

  return (
    <div className='options-container token'>
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
    </div>
  )
}
