import { GroupTypeV1, GroupTypeV2 } from './GroupType'
import { ListOrderTypeV1 } from './ListOrderType'
import { SubGroupV1, SubGroupV2 } from './SubGroup'

export interface GroupV1 {
  subGroupsById: { [subGroupId: string]: SubGroupV1 }
  index: number
  groupType: GroupTypeV1
  listOrder: ListOrderTypeV1
}

export interface GroupV2 {
  subGroupsById: { [subGroupId: string]: SubGroupV2 }
  index: number
  groupType: GroupTypeV2
  listOrder: ListOrderTypeV1
}
