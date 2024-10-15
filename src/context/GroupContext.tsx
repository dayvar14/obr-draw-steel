import { Token, Group } from '@obr'
import React, { createContext, useContext, useEffect, useState } from 'react'
import lodash from 'lodash'
import { SceneContext } from 'context/SceneContext'

interface GroupContextProps {
  groupMetadata: Group.GroupMetadata
  setGroupMetadata: (metadata: Group.GroupMetadata) => void
}

const GroupContext = createContext<GroupContextProps | undefined>(undefined)

const GroupProvider = ({ children }: { children?: React.ReactNode }) => {
  const [groupMetadata, setGroupMetadata] = useState<Group.GroupMetadata>()
  const [tokens, setTokens] = useState<Token.Token[]>([])
  const sceneContext = useContext(SceneContext)

  if (!sceneContext) {
    return null
  }
  useEffect(() => {
    const fetchGroupMetadata = async () => {
      const groupMetadata = await Group.getGroupMetadata()
      setGroupMetadata(groupMetadata)
    }

    Group.onGroupMetadataChange(metadata => {
      setGroupMetadata(metadata)
    })

    fetchGroupMetadata()
  }, [])

  useEffect(() => {
    Token.setTokensListener(tokens => {
      setTokens(tokens)
    })

    const fetchTokens = async () => {
      try {
        const tokens = await Token.getTokens()
        setTokens(tokens)
      } catch (error) {
        console.error('Error fetching tokenState:', error)
      }
    }
    if (!tokens) fetchTokens()
  }, [])

  useEffect(() => {
    if (!groupMetadata) return
    const newGroupMetadata = updateGroupMetadataFromTokens(
      tokens,
      groupMetadata,
    )

    setGroupMetadata(newGroupMetadata)
    Group.updateGroupMetadata(newGroupMetadata)
  }, [tokens])

  if (groupMetadata) {
    const contextValue: GroupContextProps = {
      groupMetadata,
      setGroupMetadata,
    }
    return (
      <GroupContext.Provider value={contextValue}>
        {children}
      </GroupContext.Provider>
    )
  } else return null
}

const updateGroupMetadataFromTokens = (
  tokens: Token.Token[],
  groupMetadata: Group.GroupMetadata,
) => {
  const tokensById = tokens.reduce(
    (acc, token) => {
      acc[token.id] = token
      return acc
    },
    {} as { [key: string]: Token.Token },
  )

  const groupMetadataCopy = lodash.cloneDeep(groupMetadata)
  const groupsByType = groupMetadataCopy.groupsByType

  const subgroupNames = Group.getSetOfSubGroupNames(groupMetadataCopy)

  Object.keys(tokensById).forEach(tokenId => {
    const token = tokensById[tokenId]
    const group = groupsByType[token.tokenMetadata.groupType]

    // Gets the max index to ensure item is placed at end of list
    let maxIndex = 0

    let subGroup: Group.SubGroup =
      group.subGroupsById[token.tokenMetadata.subGroupId]
    // If the token doesn't already exist in a subGroup, create a new subGroup

    const subGroupName = Group.getSubGroupName(subgroupNames)

    subgroupNames.add(subGroupName)

    if (!subGroup) {
      subGroup = {
        maxTurns: 1,
        subGroupName: subGroupName,
        currentTurn: 0,
        maxReactions: 1,
        currentReaction: 0,
        subGroupId: token.tokenMetadata.subGroupId,
        tokensById: {},
        index: maxIndex + 1,
        isVisible: token.isVisible,
        groupType: group.groupType,
      }
      group.subGroupsById[token.tokenMetadata.subGroupId] = subGroup
      subgroupNames.add(subGroupName)
    }

    subGroup.tokensById[token.id] = token
  })

  Object.keys(groupsByType).forEach(groupType => {
    const group = groupsByType[groupType as Group.GroupType]
    Object.keys(group.subGroupsById).forEach(subGroupId => {
      const subGroup = group.subGroupsById[subGroupId]
      // isVisible is false by default, set it to true if any token is visible
      let isVisible = false
      Object.keys(subGroup.tokensById).forEach(tokenId => {
        // If tokenId not exist in subgroup delete it
        if (!tokensById[tokenId]) {
          delete subGroup.tokensById[tokenId]
        } else {
          isVisible = isVisible || tokensById[tokenId].isVisible
        }
      })
      group.subGroupsById[subGroupId].isVisible = isVisible

      // If a subgroup has no tokens, delete it
      if (Object.keys(subGroup.tokensById).length === 0)
        delete group.subGroupsById[subGroupId]
    })
  })

  return groupMetadataCopy
}


export { GroupProvider, GroupContext }
