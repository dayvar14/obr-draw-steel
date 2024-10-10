import React from 'react'
import SelectIcon from '@icons/select.svg?react'
import DeleteIcon from '@icons/delete.svg?react'
import { Player, Group } from '@obr'
import { GroupContext } from 'context/GroupContext'

export const TokenOptionsList: React.FC<{
  subGroupId: string
  groupType: Group.GroupType
  tokenId: string
  onClickButton: () => void
}> = ({ subGroupId, groupType, tokenId, onClickButton }) => {
  const groupContext = React.useContext(GroupContext)
  if (!groupContext) {
    return null
  }

  const subGroup =
    groupContext.groupMetadata.groupsByType[groupType].subGroupsById[subGroupId]

  if (!subGroup) {
    return <></>
  }

  const token = subGroup.tokensById[tokenId]

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
