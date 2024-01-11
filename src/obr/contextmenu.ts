import OBR, { ContextMenuItem } from '@owlbear-rodeo/sdk'

import {
  FOES_TOGGLE_CONTEXT_MENU_ID,
  FOES_TOGGLE_METADATA_ID,
  FRIENDS_TOGGLE_CONTEXT_MENU_ID,
  FRIENDS_TOGGLE_METADATA_ID,
  TURN_TOGGLE_CONTEXT_MENU_ID,
  TURN_TOGGLE_METADATA_ID,
} from '../config.ts'
import { foesIcons, friendsIcons, turnIcons } from './icons.ts'
import { Token } from './tokens.ts'

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
        TURN_TOGGLE_METADATA_ID,
      ),
    })

    OBR.contextMenu.create({
      id: FOES_TOGGLE_CONTEXT_MENU_ID,
      icons: foesIcons,
      onClick: createToggleClickFunc(
        FOES_TOGGLE_METADATA_ID,
        TURN_TOGGLE_METADATA_ID,
      ),
    })

    OBR.contextMenu.create({
      id: TURN_TOGGLE_CONTEXT_MENU_ID,
      icons: turnIcons,
      onClick: createTurnToggleClickFunc(TURN_TOGGLE_METADATA_ID),
    })
  })
}

export const clearFriends = () => {
  clearMetadata(FRIENDS_TOGGLE_METADATA_ID, TURN_TOGGLE_METADATA_ID)
}

export const clearFoes = () => {
  clearMetadata(FOES_TOGGLE_METADATA_ID, TURN_TOGGLE_METADATA_ID)
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

export const toggleTokensTurn = (tokens: Token[], isChecked: boolean) => {
  toggleTurnMetadata(tokens, TURN_TOGGLE_METADATA_ID, isChecked)
}

const toggleTurnMetadata = (
  tokens: Token[],
  turnMetadataId: string,
  isChecked: boolean,
) => {
  const tokenIds = new Set(tokens.map((token) => token.id))
  OBR.scene.items.updateItems(
    item => tokenIds.has(item.id),
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
  clearTurnMetadata(TURN_TOGGLE_METADATA_ID)
}
