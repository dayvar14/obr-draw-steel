import OBR, { ContextMenuItem, Image, isImage } from '@owlbear-rodeo/sdk'

import {
  FOES_TOGGLE_METADATA_ID,
  FRIENDS_TOGGLE_METADATA_ID,
  TURN_TOGGLE_METADATA_ID,
} from '../config.ts'

import { generateGroupIdFromImage } from './common.ts'
import { Token } from './tokens.ts'

interface TokenTurnMetadata {
  groupId: string
}

const clearFriends = () => {
  clearMetadata(FRIENDS_TOGGLE_METADATA_ID, TURN_TOGGLE_METADATA_ID)
}

const clearFoes = () => {
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

const setTokenTurnMetadata = (items: any[], tokenTurnMetadataId: string) => {
  // We store group ids so that we can
  const groupIds = new Set<string>()
  const itemIds = new Set<string>()

  // We toggle the turn for all tokens in the context
  for (const item of items) {
    if (isImage(item)) {
      const groupId = generateGroupIdFromImage(item)
      const tokenTurnMetadata: TokenTurnMetadata = {
        groupId: generateGroupIdFromImage(item),
      }
      item.metadata[tokenTurnMetadataId] = tokenTurnMetadata

      groupIds.add(groupId)
      itemIds.add(item.id)
    }
  }

  // We need to set the turn for all other tokens clumped with the tokens in the context
  OBR.scene.items.updateItems(
    item =>
      !itemIds.has(item.id) &&
      isImage(item) &&
      item.metadata[tokenTurnMetadataId] === undefined &&
      groupIds.has(generateGroupIdFromImage(item)),
    items => setTokenTurnMetadataForGroup(items, tokenTurnMetadataId),
  )
}

const setTokenTurnMetadataForGroup = (
  items: Image[],
  tokenTurnMetadataId: string,
) => {
  for (const item of items) {
    const groupId = generateGroupIdFromImage(item)
    const tokenTurnMetadata: TokenTurnMetadata = {
      groupId: groupId,
    }
    item.metadata[tokenTurnMetadataId] = tokenTurnMetadata
  }
}

const deleteTokenTurnMetadata = (items: any[], tokenTurnMetadataId: string) => {
  // We need to know which groups to delete from
  const groupIds = new Set<string>()
  // We store item ids so we dont re modify itemds we already modified
  const itemIds = new Set<string>()
  for (const item of items) {
    if (isImage(item)) {
      const groupId = generateGroupIdFromImage(item)
      groupIds.add(groupId)
      itemIds.add(item.id)
    }

    delete item.metadata[tokenTurnMetadataId]
  }

  OBR.scene.items.updateItems(
    // If item is not in the list of items we already modified, and and it shares a groupId with the items in the context
    item =>
      !itemIds.has(item.id) &&
      isImage(item) &&
      item.metadata[tokenTurnMetadataId] !== undefined &&
      item.metadata[tokenTurnMetadataId] !== null &&
      'groupId' in (item.metadata[tokenTurnMetadataId] as TokenTurnMetadata) &&
      groupIds.has(
        (item.metadata[tokenTurnMetadataId] as TokenTurnMetadata).groupId,
      ),
    items => deleteTokenTurnMetadataForGroup(items, tokenTurnMetadataId),
  )
}

const deleteTokenTurnMetadataForGroup = (
  items: Image[],
  tokenTurnMetadataId: string,
) => {
  for (const item of items) {
    delete item.metadata[tokenTurnMetadataId]
  }
}

// const setTurnFromGroupId = (groupId: string, isChecked: boolean) => {
//   OBR.scene.items.updateItems(
//     // If token state is set, and the groupId matches, then we want to toggle it
//     item =>
//       item.metadata[groupId] !== undefined &&
//       'groupId' in (item.metadata[groupId] as TokenTurnMetadata) &&
//       (item.metadata[groupId] as TokenTurnMetadata).groupId === groupId,
//     items => {
//       const images = items as Image[]
//       for (const image of images) {
//         if (!isChecked) {
//           image.metadata[TURN_TOGGLE_METADATA_ID] = {}
//         } else {
//           delete image.metadata[TURN_TOGGLE_METADATA_ID]
//         }
//       }
//     },
//   )
// }

const clearAllTurns = () => {
  OBR.scene.items.updateItems(
    item => item.metadata[TURN_TOGGLE_METADATA_ID] !== undefined,
    items => {
      for (const item of items) {
        delete item.metadata[TURN_TOGGLE_METADATA_ID]
      }
    },
  )
}

const setTurnMetadataFromTokens = (tokens: Token[], isChecked: boolean) => {
  // Ignore cases where there are no tokens
  if (tokens.length === 0) {
    return
  }

  const tokenIds = new Set<string>()

  for (const token of tokens) {
    tokenIds.add(token.id)
  }

  OBR.scene.items.updateItems(
    item => tokenIds.has(item.id),
    items => {
      for (const item of items) {
        if (isChecked) {
          delete item.metadata[TURN_TOGGLE_METADATA_ID]
        } else {
          item.metadata[TURN_TOGGLE_METADATA_ID] = {}
        }
      }
    },
  )
}

export default {
  clearFriends,
  clearFoes,
  clearAllTurns,
  setTurnMetadataFromTokens,
}

export const createTurnToggleClickFunc = (turnMetadataId: string) => {
  const TurnToggleClickFunc: ContextMenuItem['onClick'] = context => {
    const turnToggleEnabled = context.items.every(
      item => item.metadata[turnMetadataId] === undefined,
    )

    if (turnToggleEnabled) {
      OBR.scene.items.updateItems(context.items, items =>
        setTokenTurnMetadata(items, turnMetadataId),
      )
    } else {
      OBR.scene.items.updateItems(context.items, items =>
        deleteTokenTurnMetadata(items, turnMetadataId),
      )
    }
  }
  return TurnToggleClickFunc
}

export const createToggleClickFunc = (
  metadataId: string,
  turnMetadataId: string,
) => {
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
