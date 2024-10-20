import {
  GroupMetadata,
  GroupSplittingMode,
  GroupType,
  ListOrderType,
  SubGroup,
} from '@data'
import { Token } from './tokens'
import OBR from '@owlbear-rodeo/sdk'
import { v5 as uuidv5 } from 'uuid'

import { APP_VERSION, GROUP_METADATA_ID } from 'config'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Group {
  export const getNameFromGroupType = (groupType: GroupType) => {
    switch (groupType) {
      case GroupType.ALLY:
        return 'Allies'
      case GroupType.ENEMY:
        return 'Enemies'
    }
  }

  const DEFAULT_GROUP_METADATA: GroupMetadata = {
    groupsByType: {
      [GroupType.ALLY]: {
        subGroupsById: {},
        index: 0,
        groupType: GroupType.ALLY,
        listOrder: ListOrderType.ALPHA_DESC,
      },
      [GroupType.ENEMY]: {
        subGroupsById: {},
        index: 1,
        groupType: GroupType.ENEMY,
        listOrder: ListOrderType.ALPHA_DESC,
      },
    },
    appVersion: APP_VERSION,
  }

  export const getGroupMetadata = async () => {
    const metadata = await OBR.scene.getMetadata()

    let groupMetadata = DEFAULT_GROUP_METADATA

    if (metadata[GROUP_METADATA_ID]) {
      groupMetadata = metadata[GROUP_METADATA_ID] as GroupMetadata
    }

    return groupMetadata
  }

  export const updateGroupMetadata = async (metadata: GroupMetadata) => {
    await OBR.scene
      .setMetadata({ [GROUP_METADATA_ID]: metadata })
      .then(() => {})
  }

  export const onGroupMetadataChange = (
    onChange: (metadata: GroupMetadata) => void,
  ) => {
    OBR.scene.onMetadataChange(metadata => {
      let groupMetadata: GroupMetadata = DEFAULT_GROUP_METADATA
      if (metadata[GROUP_METADATA_ID]) {
        groupMetadata = metadata[GROUP_METADATA_ID] as GroupMetadata
      }
      onChange(groupMetadata)
    })
  }

  export const clearSubGroups = async (groupType: GroupType) => {
    const groupMetadata = await getGroupMetadata()
    groupMetadata.groupsByType[groupType].subGroupsById = {}
    await updateGroupMetadata(groupMetadata)
  }

  export const getSubGroupById = async (
    groupType: GroupType,
    subGroupId: string,
  ) => {
    const groupMetadata = await getGroupMetadata()
    const group = groupMetadata.groupsByType[groupType]
    const subGroup = group.subGroupsById[subGroupId]
    return subGroup
  }

  export const updateSubgroupByGroupType = async (
    groupType: GroupType,
    subGroup: SubGroup,
  ) => {
    const groupMetadata = await getGroupMetadata()
    const group = groupMetadata.groupsByType[groupType]
    group.subGroupsById[subGroup.subGroupId] = subGroup
    groupMetadata.groupsByType[groupType] = group
    await updateGroupMetadata(groupMetadata)
  }

  export const getGroupSplittingName = (splittingMode: GroupSplittingMode) => {
    switch (splittingMode) {
      case GroupSplittingMode.CLOSEST:
        return 'Closest'
      case GroupSplittingMode.RANDOM:
        return 'Random'
      case GroupSplittingMode.LAYERED:
        return 'Layered'
    }
  }

  export const getSetOfSubGroupNames = (groupMetadata: GroupMetadata) => {
    const subGroupNames = new Set<string>()

    Object.values(groupMetadata.groupsByType).forEach(group => {
      Object.values(group.subGroupsById).forEach(subGroup => {
        if (subGroup.subGroupName) {
          subGroupNames.add(subGroup.subGroupName)
        }
      })
    })

    return subGroupNames
  }

  export const getSubGroupName = (setOfGroupNames: Set<string>) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (let i = 0; i < alphabet.length; i++) {
      const letter = alphabet[i]
      if (!setOfGroupNames.has(`Group ${letter}`)) {
        return `Group ${letter}`
      }
    }

    let index = 1
    while (true) {
      for (let i = 0; i < alphabet.length; i++) {
        const letter = alphabet[i]
        const groupName =
          index === 1 ? `Group ${letter}` : `Group ${letter}${index}`
        if (!setOfGroupNames.has(groupName)) {
          return groupName
        }
      }
      index++
    }
  }

  export const splitSubgroup = async (
    subGroup: SubGroup,
    groupSize: number,
    splittingMode: GroupSplittingMode,
    tokens: Token.Token[],
  ) => {
    const groupMetadata = await getGroupMetadata()
    let splitSubgroupsById: { [subGroupId: string]: SubGroup } = {
      [subGroup.subGroupId]: subGroup,
    }

    const subGroupNames = getSetOfSubGroupNames(groupMetadata)
    subGroupNames.delete(subGroup.subGroupName)

    if (Object.keys(subGroup.tokenIds).length <= groupSize) return

    switch (splittingMode) {
      case GroupSplittingMode.CLOSEST:
        splitSubgroupsById = proximityBasedSplittingAlgorithm(
          subGroup,
          groupSize,
          subGroupNames,
          tokens,
        )
        break
      case GroupSplittingMode.LAYERED:
        splitSubgroupsById = hierarchicalClusteringSplittingAlgorithm(
          subGroup,
          groupSize,
          subGroupNames,
          tokens,
        )
        break
      default:
        splitSubgroupsById = randomSplittingAlgorithm(
          subGroup,
          groupSize,
          subGroupNames,
          tokens,
        )
        break
    }

    delete groupMetadata.groupsByType[subGroup.groupType].subGroupsById[
      subGroup.subGroupId
    ]

    Object.keys(splitSubgroupsById).forEach(subGroupId => {
      groupMetadata.groupsByType[subGroup.groupType].subGroupsById[subGroupId] =
        splitSubgroupsById[subGroupId]
    })

    await updateGroupMetadata(groupMetadata)
    await Token.updateTokens(tokens)
  }
}

function proximityBasedSplittingAlgorithm(
  subGroup: SubGroup,
  groupSize: number,
  subGroupNames: Set<string>,
  tokens: Token.Token[],
) {
  const totalGroups = Math.ceil(tokens.length / groupSize) // Correctly calculate the number of groups

  if (totalGroups === 0) {
    return { [uuidv5(subGroup.subGroupId, uuidv5.DNS)]: subGroup } // Return early if the total groups are 0
  }

  // Get data points based on token positions
  const data = tokens.map(token => ({
    token,
    position: [token.mapPosition.x, token.mapPosition.y],
  }))

  // Function to calculate Euclidean distance between two points
  const euclideanDistance = ([x1, y1]: number[], [x2, y2]: number[]) => {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
  }

  // Sort tokens by proximity (using a simple greedy approach)
  const sortedTokens = [data[0]] // Start with the first token

  while (sortedTokens.length < data.length) {
    // Find the closest token to the last added one
    const lastTokenPosition = sortedTokens[sortedTokens.length - 1].position
    const remainingTokens = data.filter(
      d => !sortedTokens.some(t => t.token.id === d.token.id),
    )

    const closestToken = remainingTokens.reduce((closest, current) => {
      const distanceToCurrent = euclideanDistance(
        lastTokenPosition,
        current.position,
      )
      const distanceToClosest = euclideanDistance(
        lastTokenPosition,
        closest.position,
      )
      return distanceToCurrent < distanceToClosest ? current : closest
    }, remainingTokens[0])

    sortedTokens.push(closestToken) // Add the closest token to the sorted list
  }

  // Now, split the sorted tokens into groups
  const tokenGroups: Token.Token[][] = Array.from(
    { length: totalGroups },
    () => [],
  )

  sortedTokens.forEach((item, index) => {
    const groupIndex = Math.floor(index / groupSize) // Determine the group index
    // Ensure the group exists before pushing
    if (tokenGroups[groupIndex]) {
      tokenGroups[groupIndex].push(item.token)
    } else {
      console.error(`Group index ${groupIndex} is out of bounds.`)
    }
  })

  // Create subGroups and assign tokens
  let subGroupById: { [subGroupId: string]: SubGroup } = {}

  tokenGroups.forEach((group, groupIndex) => {
    if (group.length > 0) {
      const subGroupId = uuidv5(
        `${group[0].id}-${new Date().toISOString()}`,
        uuidv5.DNS,
      )

      let subGroupName = ''
      if (group.length === 1) {
        subGroupName = group[0].plainTextName
          ? group[0].plainTextName
          : group[0].name
      } else {
        subGroupName = Group.getSubGroupName(subGroupNames)
        subGroupNames.add(subGroupName)
      }

      let newSubGroup: SubGroup = {
        maxTurns: 1,
        subGroupName: subGroupName,
        currentTurn: 0,
        maxReactions: 1,
        currentReaction: 0,
        subGroupId: subGroupId,
        tokenIds: [],
        index: groupIndex,
        groupType: subGroup.groupType,
      }

      group.forEach(token => {
        token.tokenMetadata.subGroupId = subGroupId
        newSubGroup.tokenIds.push(token.id)
      })

      subGroupById[subGroupId] = newSubGroup
    }
  })

  return subGroupById
}

function hierarchicalClusteringSplittingAlgorithm(
  subGroup: SubGroup,
  groupSize: number,
  subGroupNames: Set<string>,
  tokens: Token.Token[],
) {
  const totalGroups = Math.ceil(tokens.length / groupSize) // Number of groups

  if (totalGroups === 0) {
    return { [uuidv5(subGroup.subGroupId, uuidv5.DNS)]: subGroup } // Edge case: no tokens
  }

  // Get token positions
  const data = tokens.map(token => ({
    token,
    position: [token.mapPosition.x, token.mapPosition.y],
  }))

  // Function to calculate Euclidean distance between two points
  const euclideanDistance = ([x1, y1]: number[], [x2, y2]: number[]) => {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2))
  }

  // Initialize each token as its own cluster
  let clusters = data.map(item => ({
    tokens: [item.token],
    centroid: item.position,
  }))

  // Function to calculate centroid of a group of points
  const calculateCentroid = (points: number[][]) => {
    const n = points.length
    const sum = points.reduce(
      (acc, curr) => [acc[0] + curr[0], acc[1] + curr[1]],
      [0, 0],
    )
    return [sum[0] / n, sum[1] / n]
  }

  // Merge clusters until the number of clusters matches totalGroups and no group exceeds groupSize
  while (clusters.length > totalGroups) {
    let minDistance = Infinity
    let pairToMerge: [number, number] | null = null

    // Find the closest pair of clusters that both have room for more tokens
    for (let i = 0; i < clusters.length - 1; i++) {
      if (clusters[i].tokens.length >= groupSize) continue // Skip if cluster is already at max size

      for (let j = i + 1; j < clusters.length; j++) {
        if (clusters[j].tokens.length >= groupSize) continue // Skip if cluster is already at max size

        const distance = euclideanDistance(
          clusters[i].centroid,
          clusters[j].centroid,
        )

        if (distance < minDistance) {
          minDistance = distance
          pairToMerge = [i, j]
        }
      }
    }

    if (!pairToMerge) {
      break // No more valid pairs to merge, exit the loop
    }

    const [i, j] = pairToMerge
    const mergedTokens = clusters[i].tokens.concat(clusters[j].tokens)

    if (mergedTokens.length <= groupSize) {
      // If the merged group doesn't exceed the groupSize, merge them
      const mergedPositions = mergedTokens.map(t => [
        t.mapPosition.x,
        t.mapPosition.y,
      ])
      const newCentroid = calculateCentroid(mergedPositions)

      // Replace the two clusters with the new merged cluster
      clusters.splice(j, 1) // Remove the second cluster first (j > i)
      clusters[i] = {
        tokens: mergedTokens,
        centroid: newCentroid,
      }
    } else {
      // If merging would exceed the groupSize, stop merging these clusters
      break
    }
  }

  // Now, ensure no group exceeds the groupSize, splitting clusters if necessary
  const splitClusters: typeof clusters = []

  clusters.forEach(cluster => {
    if (cluster.tokens.length > groupSize) {
      // Split the cluster into smaller groups
      while (cluster.tokens.length > groupSize) {
        const splitGroup = cluster.tokens.splice(0, groupSize)
        const splitCentroid = calculateCentroid(
          splitGroup.map(t => [t.mapPosition.x, t.mapPosition.y]),
        )
        splitClusters.push({
          tokens: splitGroup,
          centroid: splitCentroid,
        })
      }

      // Add remaining tokens (less than groupSize)
      if (cluster.tokens.length > 0) {
        const remainingCentroid = calculateCentroid(
          cluster.tokens.map(t => [t.mapPosition.x, t.mapPosition.y]),
        )
        splitClusters.push({
          tokens: cluster.tokens,
          centroid: remainingCentroid,
        })
      }
    } else {
      // Add the cluster as is if it's within groupSize
      splitClusters.push(cluster)
    }
  })

  // Create subGroups from split clusters
  let subGroupById: { [subGroupId: string]: SubGroup } = {}

  splitClusters.forEach((cluster, clusterIndex) => {
    const subGroupId = uuidv5(
      `${cluster.tokens[0].id}-${new Date().toISOString()}`,
      uuidv5.DNS,
    )
    let subGroupName = ''
    if (cluster.tokens.length === 1) {
      subGroupName = cluster.tokens[0].plainTextName
        ? cluster.tokens[0].plainTextName
        : cluster.tokens[0].name
    } else {
      subGroupName = Group.getSubGroupName(subGroupNames)
      subGroupNames.add(subGroupName)
    }

    let newSubGroup: SubGroup = {
      maxTurns: 1,
      subGroupName: subGroupName,
      currentTurn: 0,
      maxReactions: 1,
      currentReaction: 0,
      subGroupId: subGroupId,
      tokenIds: [],
      index: clusterIndex,
      groupType: subGroup.groupType,
    }

    cluster.tokens.forEach(token => {
      token.tokenMetadata.subGroupId = subGroupId
      newSubGroup.tokenIds.push(token.id)
    })

    subGroupById[subGroupId] = newSubGroup
  })

  return subGroupById
}

function randomSplittingAlgorithm(
  subGroup: SubGroup,
  groupSize: number,
  subGroupNames: Set<string>,
  tokens: Token.Token[],
) {
  // Shuffle the tokens array
  const shuffledTokens = tokens
    .map(value => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)

  // Split the shuffled array into smaller arrays of groupSize
  const tokenGroups: Token.Token[][] = []
  for (let i = 0; i < shuffledTokens.length; i += groupSize) {
    tokenGroups.push(shuffledTokens.slice(i, i + groupSize))
  }

  let subGroupById: { [subGroupId: string]: SubGroup } = {}

  tokenGroups.forEach((group, groupIndex) => {
    if (group.length > 0) {
      const subGroupId = uuidv5(
        `${group[0].id}-${new Date().toISOString()}`,
        uuidv5.DNS,
      )

      let subGroupName = ''
      if (group.length === 1) {
        subGroupName = group[0].plainTextName
          ? group[0].plainTextName
          : group[0].name
      } else {
        subGroupName = Group.getSubGroupName(subGroupNames)
        subGroupNames.add(subGroupName)
      }

      let newSubGroup: SubGroup = {
        maxTurns: 1,
        subGroupName: subGroupName,
        currentTurn: 0,
        maxReactions: 1,
        currentReaction: 0,
        subGroupId: subGroupId,
        tokenIds: [],
        index: groupIndex,
        groupType: subGroup.groupType,
      }

      group.forEach(token => {
        token.tokenMetadata.subGroupId = subGroupId
        newSubGroup.tokenIds.push(token.id)
      })

      subGroupById[subGroupId] = newSubGroup
    }
  })

  return subGroupById
}
