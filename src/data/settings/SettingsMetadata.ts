import { VersionedMetadataV1 } from 'data/common/VersionedMetadata'
import { SettingsV1 } from './Settings'

export interface SettingsMetadataV1 extends VersionedMetadataV1 {
  settings: SettingsV1
}
