import {
  GroupSplittingMode,
  Settings as SettingsData,
  SettingsMetadata,
} from '@data'
import OBR from '@owlbear-rodeo/sdk'

import { APP_VERSION, SETTINGS_METADATA_ID } from 'config'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Settings {
  const DEFAULT_SCENE_METADATA: SettingsMetadata = {
    appVersion: APP_VERSION,
    settings: {
      main: {
        reactionsEnabled: false,
      },
      playerAccess: {
        canOpenAllOptions: false,
        canOpenOptionsIfPlayerOwned: false,
        canSeeTurnCount: true,
      },
      grouping: {
        isEnabled: true,
        groupSplittingMode: GroupSplittingMode.CLOSEST,
      },
      misc: {
        flagColorIsPlayerOwnerColor: false,
      },
    },
  }

  export const getSettingsMetadata = async () => {
    const metadata = await OBR.scene.getMetadata()

    let settingsMetadata: SettingsMetadata = DEFAULT_SCENE_METADATA

    if (metadata[SETTINGS_METADATA_ID]) {
      settingsMetadata = metadata[SETTINGS_METADATA_ID] as SettingsMetadata
    }

    return settingsMetadata
  }

  export const updateSettingsMetadata = async (metadata: SettingsMetadata) => {
    await OBR.scene.setMetadata({ [SETTINGS_METADATA_ID]: metadata })
  }

  export const onSettingsMetadataChange = (
    onChange: (metadata: SettingsMetadata) => void,
  ) => {
    OBR.scene.onMetadataChange(metadata => {
      let settingsMetadata: SettingsMetadata = DEFAULT_SCENE_METADATA
      if (metadata[SETTINGS_METADATA_ID]) {
        settingsMetadata = metadata[SETTINGS_METADATA_ID] as SettingsMetadata
      }
      onChange(settingsMetadata)
    })
  }

  export const getSettings = async () => {
    const settingsMetadata = await getSettingsMetadata()
    return settingsMetadata.settings
  }

  export const updateSettings = async (settings: SettingsData) => {
    const settingsMetadata = await getSettingsMetadata()
    settingsMetadata.settings = settings
    await updateSettingsMetadata(settingsMetadata)
  }
}
