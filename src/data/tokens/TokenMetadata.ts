import { VersionedMetadataV1 } from 'data/common/VersionedMetadata'
import { GroupTypeV1, GroupTypeV2 } from 'data/group/GroupType'

export interface TokenMetadataV1 {
  groupType: GroupTypeV1
  subGroupId: string
}

export interface TokenMetadataV2 extends VersionedMetadataV1 {
  groupType: GroupTypeV2
  subGroupId: string
}
