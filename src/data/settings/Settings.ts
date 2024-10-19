import { GroupSplittingModeV1 } from 'data/group/GroupSplittingMode'

export interface SettingsV1 {
  main: {
    reactionsEnabled: boolean
  }
  playerAccess: {
    canOpenAllOptions: boolean
    canSeeTurnCount: boolean
    canOpenOptionsIfPlayerOwned: boolean
  }
  grouping: {
    isEnabled: boolean
    groupSplittingMode: GroupSplittingModeV1
  }
  misc: {
    flagColorIsPlayerOwnerColor: boolean
  }
}
