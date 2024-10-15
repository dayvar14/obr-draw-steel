import OBR from '@owlbear-rodeo/sdk'

export const upgradeMetadata = async () => {
  deleteRelicMetadata()
}

const deleteRelicMetadata = async () => {
  const FRIENDS_TOGGLE_METADATA_ID =
    'com.danielayvar.obr-draw-steel/friends-toggle-metadata-id'
  OBR.scene.items.updateItems(
    item => item.metadata[FRIENDS_TOGGLE_METADATA_ID] !== undefined,
    items => {
      for (const item of items) {
        delete item.metadata[FRIENDS_TOGGLE_METADATA_ID]
      }
    },
  )

  const FOES_TOGGLE_METADATA_ID =
    'com.danielayvar.obr-draw-steel/foes-toggle-metadata-id'

  OBR.scene.items.updateItems(
    item => item.metadata[FOES_TOGGLE_METADATA_ID] !== undefined,
    items => {
      for (const item of items) {
        delete item.metadata[FOES_TOGGLE_METADATA_ID]
      }
    },
  )

  const TURN_TOGGLE_METADATA_ID =
    'com.danielayvar.obr-draw-steel/turn-toggle-metadata-id'

  OBR.scene.items.updateItems(
    item => item.metadata[TURN_TOGGLE_METADATA_ID] !== undefined,
    items => {
      for (const item of items) {
        delete item.metadata[TURN_TOGGLE_METADATA_ID]
      }
    },
  )

  const SCENE_METADATA_ID = 'com.danielayvar.obr-draw-steel/scene-metadata-id'
  OBR.scene.setMetadata({ [SCENE_METADATA_ID]: undefined })
}
