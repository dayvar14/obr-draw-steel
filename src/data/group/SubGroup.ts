import { GroupTypeV1, GroupTypeV2 } from './GroupType'

export interface SubGroupV1 {
  subGroupName: string
  maxTurns: number
  currentTurn: number
  maxReactions: number
  currentReaction: number
  subGroupId: string
  groupType: GroupTypeV1
  tokensById: { [tokenId: string]: { id: string; [key: string]: any } }
  index: number
}

export interface SubGroupV2 {
  subGroupName: string
  maxTurns: number
  currentTurn: number
  maxReactions: number
  currentReaction: number
  subGroupId: string
  groupType: GroupTypeV2
  tokenIds: string[]
  index: number
}
