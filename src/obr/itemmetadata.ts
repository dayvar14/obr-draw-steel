import OBR, { ContextMenuItem, Image, isImage } from '@owlbear-rodeo/sdk'

import {
  FOES_TOGGLE_METADATA_ID,
  FRIENDS_TOGGLE_METADATA_ID,
  TURN_TOGGLE_METADATA_ID,
} from '../config.js'

import { generateGroupIdFromImage } from './common.ts'
import { Token } from './tokens.ts'

interface TokenTurnMetadata {
  groupId: string
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

const clearMetadata = async (metadataId: string, turnMetadataId: string) => {
  await OBR.scene.items.updateItems(
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

export module Metadata {
  export const clearFriends = async () => {
    await clearMetadata(FRIENDS_TOGGLE_METADATA_ID, TURN_TOGGLE_METADATA_ID)
  }

  export const clearFoes = async () => {
    await clearMetadata(FOES_TOGGLE_METADATA_ID, TURN_TOGGLE_METADATA_ID)
  }

  export const clearAllTurns = () => {
    OBR.scene.items.updateItems(
      item => item.metadata[TURN_TOGGLE_METADATA_ID] !== undefined,
      items => {
        for (const item of items) {
          delete item.metadata[TURN_TOGGLE_METADATA_ID]
        }
      },
    )
  }

  export const setTurnMetadataFromTokens = (
    tokens: Token.Token[],
    isChecked: boolean,
  ) => {
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
}
