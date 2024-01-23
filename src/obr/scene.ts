import OBR from '@owlbear-rodeo/sdk'
import { APP_VERSION, SCENE_METADATA_ID } from 'config'
import { Token } from './tokens'

export module Scene {
  export interface SceneMetadata {
    appVersion: string
    settings: SettingsMetadata
    listOrders: {
      friends: ListOrderMetadata
      foes: ListOrderMetadata
    }
  }

  export interface SettingsMetadata {
    playerAccess: {
      canModifyAllTurns: boolean
      canSetTurnIfPlayerOwned: boolean
      canseeTurnCount: boolean
    }
    grouping: {
      isEnabled: boolean
      groupTokensFromAllUsers: boolean
      groupSplittingMode: Token.GroupSplittingMode
    }
    misc: {
      flagColorIsPlayerOwnerColor: boolean
    }
  }

  export interface ListOrderMetadata {
    type: ListOrderType
    indexes: string[]
  }

  export enum ListOrderType {
    ALPHA_ASC = 'ALPHA_ASC',
    ALPHA_DESC = 'ALPHA_DESC',
    INDEX = 'INDEX',
    NONE = 'NONE',
  }

  const DEFAULT_SCENE_METADATA: SceneMetadata = {
    appVersion: APP_VERSION,
    settings: {
      playerAccess: {
        canModifyAllTurns: false,
        canSetTurnIfPlayerOwned: false,
        canseeTurnCount: false,
      },
      grouping: {
        isEnabled: true,
        groupTokensFromAllUsers: true,
        groupSplittingMode: Token.GroupSplittingMode.CLOSEST,
      },
      misc: {
        flagColorIsPlayerOwnerColor: false,
      },
    },
    listOrders: {
      friends: {
        type: ListOrderType.NONE,
        indexes: [],
      },
      foes: {
        type: ListOrderType.NONE,
        indexes: [],
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

  const updateListOrderMetadata = async (
    type: 'friends' | 'foes',
    metadata: ListOrderMetadata,
  ) => {
    const sceneMetadata = await getSceneMetadata()
    sceneMetadata.listOrders[type] = metadata
    await updateSceneMetadata(sceneMetadata)
  }

  export const updateFriendsListOrderMetadata = async (
    metadata: ListOrderMetadata,
  ) => {
    return updateListOrderMetadata('friends', metadata)
  }

  export const updateFoesListOrderMetadata = async (
    metadata: ListOrderMetadata,
  ) => {
    return updateListOrderMetadata('foes', metadata)
  }
}
