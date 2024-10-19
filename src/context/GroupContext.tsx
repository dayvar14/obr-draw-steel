import { Token, Group } from '@obr'
import { GroupMetadata, SubGroup, GroupType } from '@data'
import React, { createContext, useContext, useEffect, useState } from 'react'
import lodash, { isEqual } from 'lodash'
import { TokenContext } from './TokenContext'

interface GroupContextProps {
  groupMetadata: GroupMetadata
  tokensById: { [key: string]: Token.Token }
}

const GroupContext = createContext<GroupContextProps | undefined>(undefined)

const GroupProvider = ({ children }: { children?: React.ReactNode }) => {
  const [groupMetadata, setGroupMetadata] = useState<GroupMetadata>()
  const [tokensById, setTokensById] = useState<{ [key: string]: Token.Token }>(
    {},
  )

  const tokenContext = useContext(TokenContext)

  useEffect(() => {
    Group.onGroupMetadataChange(newGroupMetadata => {
      // Can optimize this by only updating if the metadata has changed
      setGroupMetadata(newGroupMetadata)
    })

    const fetchGroupMetadata = async () => {
      const newGroupMetadata = await Group.getGroupMetadata()
      setGroupMetadata(groupMetadata =>
        isEqual(groupMetadata, newGroupMetadata)
          ? groupMetadata
          : newGroupMetadata,
      )
    }

    fetchGroupMetadata()
  }, [])

  useEffect(() => {
    if (!tokenContext) {
      return
    }

    const updateMetadata = async () => {
      // Room for further optimization if we ignore fields we dont care about
      if (isEqual(tokenContext.tokensById, tokensById)) return

      let groupMetadataCopy = groupMetadata
      if (!groupMetadataCopy) groupMetadataCopy = await Group.getGroupMetadata()

      const newGroupMetadata = await updateGroupMetadataFromTokens(
        tokenContext.tokensById,
        groupMetadataCopy,
      )

      await Group.updateGroupMetadata(newGroupMetadata)
    }

    updateMetadata()
  }, [tokenContext])

  useEffect(() => {
    if (!groupMetadata) {
      return
    }

    let newTokensById = Object.values(groupMetadata.groupsByType).reduce(
      (acc, group) => {
        Object.values(group.subGroupsById).forEach(subGroup => {
          subGroup.tokenIds.forEach(tokenId => {
            // Firm assertaion since we know the token exists due to updating the metadata with new tokens
            const token = tokenContext!.tokensById[tokenId]
            if (token) acc[tokenId] = token
          })
        })
        return acc
      },
      {} as { [key: string]: Token.Token },
    )

    setTokensById(tokensById =>
      isEqual(tokensById, newTokensById) ? tokensById : newTokensById,
    )
  }, [groupMetadata])

  if (groupMetadata) {
    const contextValue: GroupContextProps = {
      groupMetadata,
      tokensById,
    }
    return (
      <GroupContext.Provider value={contextValue}>
        {children}
      </GroupContext.Provider>
    )
  } else return null
}

const updateGroupMetadataFromTokens = async (
  tokensById: { [key: string]: Token.Token },
  groupMetadata: GroupMetadata,
) => {
  const groupMetadataCopy = lodash.cloneDeep(groupMetadata)
  const groupsByType = groupMetadataCopy.groupsByType

  const subgroupNames = Group.getSetOfSubGroupNames(groupMetadataCopy)

  Object.keys(tokensById).forEach(tokenId => {
    const token = tokensById[tokenId]
    const group = groupsByType[token.tokenMetadata.groupType]

    // Gets the max index to ensure item is placed at end of list
    let maxIndex = 0

    let subGroup: SubGroup = group.subGroupsById[token.tokenMetadata.subGroupId]
    // If the token doesn't already exist in a subGroup, create a new subGroup

    const subGroupName = Group.getSubGroupName(subgroupNames)

    if (!subGroup) {
      subGroup = {
        maxTurns: 1,
        subGroupName: subGroupName,
        currentTurn: 0,
        maxReactions: 1,
        currentReaction: 0,
        subGroupId: token.tokenMetadata.subGroupId,
        tokenIds: [],
        index: maxIndex + 1,
        groupType: group.groupType,
      }
      group.subGroupsById[token.tokenMetadata.subGroupId] = subGroup
    }

    if (!subGroup.tokenIds.includes(tokenId)) {
      subGroup.tokenIds.push(tokenId)
    }
  })

  Object.keys(groupsByType).forEach(groupType => {
    const group = groupsByType[groupType as GroupType]
    Object.keys(group.subGroupsById).forEach(async subGroupId => {
      const subGroup = group.subGroupsById[subGroupId]

      subGroup.tokenIds.forEach(tokenId => {
        // If tokenId not exist in subgroup delete it
        if (!tokensById[tokenId]) {
          subGroup.tokenIds = subGroup.tokenIds.filter(id => id !== tokenId)
        }
      })

      // If a subgroup has no tokens, delete it
      if (Object.keys(subGroup.tokenIds).length === 0)
        delete group.subGroupsById[subGroupId]
    })
  })

  return groupMetadataCopy
}

export { GroupProvider, GroupContext }
