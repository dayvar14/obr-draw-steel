import { VersionedMetadataV1 } from 'data/common/VersionedMetadata'

import { GroupTypeV1, GroupTypeV2 } from './GroupType'
import { GroupV1, GroupV2 } from './Group'

export interface GroupMetadataV1 extends VersionedMetadataV1 {
  groupsByType: { [groupType in GroupTypeV1]: GroupV1 }
}

export interface GroupMetadataV2 extends VersionedMetadataV1 {
  groupsByType: { [groupType in GroupTypeV2]: GroupV2 }
}
