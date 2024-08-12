import OBR, { ContextMenuItem, Image, isImage } from '@owlbear-rodeo/sdk'

import {
  FOES_TOGGLE_METADATA_ID,
  FRIENDS_TOGGLE_METADATA_ID,
  REACTION_TOGGLE_METADATA_ID,
  TURN_TOGGLE_METADATA_ID,
} from '../config.js'

import { GroupIDGenerator } from './common.ts'
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
      const groupId = GroupIDGenerator.generateGroupIdFromImage(item)
      const tokenTurnMetadata: TokenTurnMetadata = {
        groupId: GroupIDGenerator.generateGroupIdFromImage(item),
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
      groupIds.has(GroupIDGenerator.generateGroupIdFromImage(item)),
    items => setTokenTurnMetadataForGroup(items, tokenTurnMetadataId),
  )
}

const setTokenTurnMetadataForGroup = (
  items: Image[],
  tokenTurnMetadataId: string,
) => {
  for (const item of items) {
    const groupId = GroupIDGenerator.generateGroupIdFromImage(item)
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
      const groupId = GroupIDGenerator.generateGroupIdFromImage(item)
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

interface TokenReactionMetadata {
  groupId: string
}

export const createReactionToggleClickFunc = (reactionMetadataId: string) => {
  const ReactionToggleClickFunc: ContextMenuItem['onClick'] = context => {
    const reactionToggleEnabled = context.items.every(
      item => item.metadata[reactionMetadataId] === undefined,
    )

    if (reactionToggleEnabled) {
      OBR.scene.items.updateItems(context.items, items =>
        setTokenReactionMetadata(items, reactionMetadataId),
      )
    } else {
      OBR.scene.items.updateItems(context.items, items =>
        deleteTokenReactionMetadata(items, reactionMetadataId),
      )
    }
  }
  return ReactionToggleClickFunc
}

const setTokenReactionMetadata = (items: any[], tokenReactionMetadataId: string) => {
  // We store group ids so that we can
  const groupIds = new Set<string>()
  const itemIds = new Set<string>()

  // We toggle the turn for all tokens in the context
  for (const item of items) {
    if (isImage(item)) {
      const groupId = GroupIDGenerator.generateGroupIdFromImage(item)
      const tokenReactionMetadata: TokenReactionMetadata = {
        groupId: GroupIDGenerator.generateGroupIdFromImage(item),
      }
      item.metadata[tokenReactionMetadataId] = tokenReactionMetadata

      groupIds.add(groupId)
      itemIds.add(item.id)
    }
  }

  // We need to set the turn for all other tokens clumped with the tokens in the context
  OBR.scene.items.updateItems(
    item =>
      !itemIds.has(item.id) &&
      isImage(item) &&
      item.metadata[tokenReactionMetadataId] === undefined &&
      groupIds.has(GroupIDGenerator.generateGroupIdFromImage(item)),
    items => setTokenReactionMetadataForGroup(items, tokenReactionMetadataId),
  )
}

const setTokenReactionMetadataForGroup = (
  items: Image[],
  tokenReactionMetadataId: string,
) => {
  for (const item of items) {
    const groupId = GroupIDGenerator.generateGroupIdFromImage(item)
    const tokenReactionMetadata: TokenReactionMetadata = {
      groupId: groupId,
    }
    item.metadata[tokenReactionMetadataId] = tokenReactionMetadata
  }
}

const deleteTokenReactionMetadata = (items: any[], tokenReactionMetadataId: string) => {
  // We need to know which groups to delete from
  const groupIds = new Set<string>()
  // We store item ids so we dont re modify itemds we already modified
  const itemIds = new Set<string>()
  for (const item of items) {
    if (isImage(item)) {
      const groupId = GroupIDGenerator.generateGroupIdFromImage(item)
      groupIds.add(groupId)
      itemIds.add(item.id)
    }

    delete item.metadata[tokenReactionMetadataId]
  }

  OBR.scene.items.updateItems(
    // If item is not in the list of items we already modified, and and it shares a groupId with the items in the context
    item =>
      !itemIds.has(item.id) &&
      isImage(item) &&
      item.metadata[tokenReactionMetadataId] !== undefined &&
      item.metadata[tokenReactionMetadataId] !== null &&
      'groupId' in (item.metadata[tokenReactionMetadataId] as TokenReactionMetadata) &&
      groupIds.has(
        (item.metadata[tokenReactionMetadataId] as TokenReactionMetadata).groupId,
      ),
    items => deleteTokenReactionMetadataForGroup(items, tokenReactionMetadataId),
  )
}

const deleteTokenReactionMetadataForGroup = (
  items: Image[],
  tokenReactionMetadataId: string,
) => {
  for (const item of items) {
    delete item.metadata[tokenReactionMetadataId]
  }
}

const clearMetadata = async (metadataId: string, turnMetadataId: string, reactionMetadataId: string) => {
  await OBR.scene.items.updateItems(
    item =>
      item.metadata[metadataId] !== undefined ||
      item.metadata[turnMetadataId] !== undefined ||
      item.metadata[reactionMetadataId] !== undefined,
    items => {
      for (const item of items) {
        delete item.metadata[metadataId]
        delete item.metadata[turnMetadataId]
        delete item.metadata[reactionMetadataId]
      }
    },
  )
}

export const createToggleClickFunc = (
  metadataId: string,
  turnMetadataId: string,
  reactionMetadataId: string,
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
          delete item.metadata[reactionMetadataId]
        }
      })
    }
  }
  return ToggleClickFunc
}

export module Metadata {
  export const clearFriends = async () => {
    await clearMetadata(FRIENDS_TOGGLE_METADATA_ID, TURN_TOGGLE_METADATA_ID, REACTION_TOGGLE_METADATA_ID)
  }

  export const clearFoes = async () => {
    await clearMetadata(FOES_TOGGLE_METADATA_ID, TURN_TOGGLE_METADATA_ID, REACTION_TOGGLE_METADATA_ID)
  }

  export const clearAllTurnsAndReactions = () => {
    OBR.scene.items.updateItems(
      item => item.metadata[TURN_TOGGLE_METADATA_ID] !== undefined ||
      item.metadata[REACTION_TOGGLE_METADATA_ID] !== undefined,
      items => {
        for (const item of items) {
          delete item.metadata[TURN_TOGGLE_METADATA_ID]
          delete item.metadata[REACTION_TOGGLE_METADATA_ID]
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

  export const setReactionMetadataFromTokens = (
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
            delete item.metadata[REACTION_TOGGLE_METADATA_ID]
          } else {
            item.metadata[REACTION_TOGGLE_METADATA_ID] = {}
          }
        }
      },
    )
  }
}
