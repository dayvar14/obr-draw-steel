import OBR from '@owlbear-rodeo/sdk'
import { VersionedMetadataV1 } from 'data/common/VersionedMetadata'
import { GroupMetadataV1, GroupMetadataV2 } from 'data/group/GroupMetadata'
import { compareSemVersions } from '../common'
import { GroupTypeV1, GroupTypeV2 } from 'data/group/GroupType'
import { SubGroupV2 } from 'data/group/SubGroup'
import { GroupV2 } from 'data/group/Group'
import { ListOrderTypeV1 } from 'data/group/ListOrderType'
import { TokenMetadataV1, TokenMetadataV2 } from 'data/tokens/TokenMetadata'

export const upgrade = async () => {
  upgradeToGroupMetadata()
  upgradeTokenMetadata()
}

// Upgrades metadata from version 0.6.0 to 0.7.0
const upgradeToGroupMetadata = async () => {
  const GROUP_METADATA_ID = 'com.danielayvar.obr-draw-steel/group-metadata-id'

  const versionedMetadata = (await OBR.scene.getMetadata())[
    GROUP_METADATA_ID
  ] as VersionedMetadataV1

  // If no metadata, return
  if (!versionedMetadata) return

  // If metadata is already at 0.7.0 or greater, return
  if (compareSemVersions(versionedMetadata.appVersion, '0.7.0') >= 0) return

  const groupMetadata = versionedMetadata as GroupMetadataV1

  const newGroupsByType: { [groupType in GroupTypeV2]: GroupV2 } = {
    [GroupTypeV2.ALLY]: {
      subGroupsById: {},
      index: 0,
      groupType: GroupTypeV2.ALLY,
      listOrder: ListOrderTypeV1.ALPHA_DESC,
    },
    [GroupTypeV2.ENEMY]: {
      subGroupsById: {},
      index: 1,
      groupType: GroupTypeV2.ENEMY,
      listOrder: ListOrderTypeV1.ALPHA_DESC,
    },
  }

  for (const groupType in groupMetadata.groupsByType) {
    const group = groupMetadata.groupsByType[groupType as GroupTypeV1]
    let newGroupType: GroupTypeV2

    if (groupType === GroupTypeV1.FOE) {
      newGroupType = GroupTypeV2.ENEMY
    } else {
      newGroupType = GroupTypeV2.ALLY
    }

    const newSubGroupsById: { [subGroupId: string]: SubGroupV2 } = {}

    for (const subGroupId in group.subGroupsById) {
      const subGroup = group.subGroupsById[subGroupId]

      const newSubGroup: SubGroupV2 = {
        subGroupName: subGroup.subGroupName,
        maxTurns: subGroup.maxTurns,
        currentTurn: subGroup.currentTurn,
        maxReactions: subGroup.maxReactions,
        currentReaction: subGroup.currentReaction,
        subGroupId: subGroup.subGroupId,
        groupType: newGroupType,
        tokenIds: Object.keys(subGroup.tokensById),
        index: subGroup.index,
      }

      newSubGroupsById[subGroupId] = newSubGroup
    }

    const newGroup: GroupV2 = {
      subGroupsById: newSubGroupsById,
      index: group.index,
      groupType: newGroupType,
      listOrder: group.listOrder,
    }

    newGroupsByType[newGroupType] = newGroup
  }

  const newGroupMetadata: GroupMetadataV2 = {
    groupsByType: newGroupsByType,
    appVersion: '0.7.0',
  }

  await OBR.scene.setMetadata({ [GROUP_METADATA_ID]: newGroupMetadata })
}

const upgradeTokenMetadata = async () => {
  const TOKEN_METADATA_ID =
    'com.danielayvar.obr-draw-steel/token-toggle-metadata-id'
  const NEW_TOKEN_METADATA_ID =
    'com.danielayvar.obr-draw-steel/token-metadata-id'

  const items = await OBR.scene.items.getItems(
    item => item.metadata[TOKEN_METADATA_ID] !== undefined,
  )

  const itemIdToNewMetadata = new Map<string, TokenMetadataV2>()

  for (const item of items) {
    const metadata = item.metadata[TOKEN_METADATA_ID] as any

    // If metadata is already at 0.7.0 or greater, return
    // Versioning for token metadata was introduced in 0.7.0
    if (metadata?.appVersion) return

    const tokenMetadata = metadata as TokenMetadataV1

    let groupType: GroupTypeV2
    if (tokenMetadata.groupType === GroupTypeV1.FRIEND) {
      groupType = GroupTypeV2.ALLY
    } else {
      groupType = GroupTypeV2.ENEMY
    }

    const newTokenMetadata: TokenMetadataV2 = {
      groupType: groupType,
      subGroupId: tokenMetadata.subGroupId,
      appVersion: '0.7.0',
    }
    itemIdToNewMetadata.set(item.id, newTokenMetadata)
  }

  await OBR.scene.items.updateItems(
    items.map(item => item.id),
    items => {
      for (const item of items) {
        item.metadata[NEW_TOKEN_METADATA_ID] = itemIdToNewMetadata.get(item.id)
        delete item.metadata[TOKEN_METADATA_ID]
      }
    },
  )
}
