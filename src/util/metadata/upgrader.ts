import { deleteRelicMetadata } from './versions/relic'
import { upgrade as upgrade0_7_0 } from './versions/v0.7.0'

export const upgradeMetadata = async () => {
  // Deletes relic metadata before 0.6.0
  deleteRelicMetadata()
  // Upgrades data to 0.7.0
  upgrade0_7_0()
}
