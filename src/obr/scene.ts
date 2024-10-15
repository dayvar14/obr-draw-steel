import { Group } from '@obr'
import OBR from '@owlbear-rodeo/sdk'
import { APP_VERSION, SCENE_METADATA_ID } from 'config'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Scene {
  export interface SceneMetadata {
    appVersion: string
    settings: SettingsMetadata
  }

  export interface SettingsMetadata {
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
      groupSplittingMode: Group.GroupSplittingMode
    }
    misc: {
      flagColorIsPlayerOwnerColor: boolean
    }
  }

  const DEFAULT_SCENE_METADATA: SceneMetadata = {
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
        groupSplittingMode: Group.GroupSplittingMode.CLOSEST,
      },
      misc: {
        flagColorIsPlayerOwnerColor: false,
      },
    },
  }

  export const getSceneMetadata = async () => {
    const metadata = await OBR.scene.getMetadata()

    let sceneMetadata: SceneMetadata = DEFAULT_SCENE_METADATA

    if (metadata[SCENE_METADATA_ID]) {
      sceneMetadata = metadata[SCENE_METADATA_ID] as SceneMetadata
    }

    return sceneMetadata
  }

  export const updateSceneMetadata = async (metadata: SceneMetadata) => {
    await OBR.scene.setMetadata({ [SCENE_METADATA_ID]: metadata })
  }

  export const onSceneMetadataChange = (
    onChange: (metadata: SceneMetadata) => void,
  ) => {
    OBR.scene.onMetadataChange(metadata => {
      let sceneMetadata: SceneMetadata = DEFAULT_SCENE_METADATA
      if (metadata[SCENE_METADATA_ID]) {
        sceneMetadata = metadata[SCENE_METADATA_ID] as SceneMetadata
      }
      onChange(sceneMetadata)
    })
  }

  export const getSettingsMetadata = async () => {
    const sceneMetadata = await getSceneMetadata()
    return sceneMetadata.settings
  }

  export const updateSettingsMetadata = async (metadata: SettingsMetadata) => {
    const sceneMetadata = await getSceneMetadata()
    sceneMetadata.settings = metadata
    await updateSceneMetadata(sceneMetadata)
  }
}
