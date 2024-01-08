import OBR, { ContextMenuItem } from '@owlbear-rodeo/sdk'

import {
  FOES_TOGGLE_CONTEXT_MENU_ID,
  FOES_TOGGLE_METADATA_ID,
  FOES_TURN_TOGGLE_CONTEXT_MENU_ID,
  FOES_TURN_TOGGLE_METADATA_ID,
  FRIENDS_TOGGLE_CONTEXT_MENU_ID,
  FRIENDS_TOGGLE_METADATA_ID,
  FRIENDS_TURN_TOGGLE_CONTEXT_MENU_ID,
  FRIENDS_TURN_TOGGLE_METADATA_ID,
} from '../config.ts'
import {
  foesIcons,
  friendsIcons,
  foeTurnIcons,
  friendTurnIcons,
} from './icons.ts'

const createToggleClickFunc = (metadataId: string, turnMetadataId: string) => {
  const ToggleClickFunc: ContextMenuItem['onClick'] = context => {
    const toggleEnabled = context.items.every(
      item => item.metadata[metadataId] === undefined,
    )

    if (toggleEnabled) {
      OBR.scene.items.updateItems(context.items, items => {
        for (const item of items) {
          item.metadata[metadataId] = {}
        }
      })
    } else {
      OBR.scene.items.updateItems(context.items, items => {
        for (const item of items) {
          delete item.metadata[metadataId]
          delete item.metadata[turnMetadataId]
        }
      })
    }
  }
  return ToggleClickFunc
}

const createTurnToggleClickFunc = (turnMetadataId: string) => {
  const TurnToggleClickFunc: ContextMenuItem['onClick'] = context => {
    const turnToggleEnabled = context.items.every(
      item => item.metadata[turnMetadataId] === undefined,
    )

    if (turnToggleEnabled) {
      OBR.scene.items.updateItems(context.items, items => {
        for (const item of items) {
          item.metadata[turnMetadataId] = {}
        }
      })
    } else {
      OBR.scene.items.updateItems(context.items, items => {
        for (const item of items) {
          delete item.metadata[turnMetadataId]
        }
      })
    }
  }
  return TurnToggleClickFunc
}

export const setupContextMenu = () => {
  OBR.onReady(() => {
    OBR.contextMenu.create({
      id: FRIENDS_TOGGLE_CONTEXT_MENU_ID,
      icons: friendsIcons,
      onClick: createToggleClickFunc(
        FRIENDS_TOGGLE_METADATA_ID,
        FRIENDS_TURN_TOGGLE_METADATA_ID,
      ),
    })

    OBR.contextMenu.create({
      id: FOES_TOGGLE_CONTEXT_MENU_ID,
      icons: foesIcons,
      onClick: createToggleClickFunc(
        FOES_TOGGLE_METADATA_ID,
        FOES_TURN_TOGGLE_METADATA_ID,
      ),
    })

    OBR.contextMenu.create({
      id: FRIENDS_TURN_TOGGLE_CONTEXT_MENU_ID,
      icons: friendTurnIcons,
      onClick: createTurnToggleClickFunc(FRIENDS_TURN_TOGGLE_METADATA_ID),
    })

    OBR.contextMenu.create({
      id: FOES_TURN_TOGGLE_CONTEXT_MENU_ID,
      icons: foeTurnIcons,
      onClick: createTurnToggleClickFunc(FOES_TURN_TOGGLE_METADATA_ID),
    })
  })
}

const clearMetadata = (metadataId: string, turnMetadataId: string) => {
  OBR.scene.items.updateItems(
    item =>
      item.metadata[metadataId] !== undefined ||
      item.metadata[turnMetadataId] !== undefined,
    items => {
      for (const item of items) {
        delete item.metadata[metadataId]
        delete item.metadata[turnMetadataId]
      }
    },
  )
}

export const clearFriends = () => {
  clearMetadata(FRIENDS_TOGGLE_METADATA_ID, FRIENDS_TURN_TOGGLE_METADATA_ID)
}

export const clearFoes = () => {
  clearMetadata(FOES_TOGGLE_METADATA_ID, FOES_TURN_TOGGLE_METADATA_ID)
}

const toggleTurnMetadata = (
  id: string,
  turnMetadataId: string,
  isChecked: boolean,
) => {
  OBR.scene.items.updateItems(
    item => item.id === id,
    items => {
      for (const item of items) {
        if (isChecked) {
          item.metadata[turnMetadataId] = {}
        } else {
          delete item.metadata[turnMetadataId]
        }
      }
    },
  )
}

export const toggleFriendTokenTurn = (id: string, isChecked: boolean) => {
  toggleTurnMetadata(id, FRIENDS_TURN_TOGGLE_METADATA_ID, isChecked)
}

export const toggleFoeTokenTurn = (id: string, isChecked: boolean) => {
  toggleTurnMetadata(id, FOES_TURN_TOGGLE_METADATA_ID, isChecked)
}

const clearTurnMetadata = (turnMetadataId: string) => {
  OBR.scene.items.updateItems(
    item => item.metadata[turnMetadataId] !== undefined,
    items => {
      for (const item of items) {
        delete item.metadata[turnMetadataId]
      }
    },
  )
}

export const clearAllTurns = () => {
  clearTurnMetadata(FRIENDS_TURN_TOGGLE_METADATA_ID)
  clearTurnMetadata(FOES_TURN_TOGGLE_METADATA_ID)
}
