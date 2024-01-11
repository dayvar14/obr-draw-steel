import OBR, { Image, Item, isImage } from '@owlbear-rodeo/sdk'
import SceneItemsApi from '@owlbear-rodeo/sdk/lib/api/scene/SceneItemsApi'

import {
  FOES_TOGGLE_METADATA_ID,
  FRIENDS_TOGGLE_METADATA_ID,
  TURN_TOGGLE_METADATA_ID,
} from '../config'
import { generateGroupIdFromImage } from './common'

export interface TokenState {
  friendGroups: Map<string, Token[]>
  foeGroups: Map<string, Token[]>
}

export interface Token {
  createdUserId: string
  id: string
  groupId: string
  name: string
  imageUrl: string
  isVisible: boolean
  isFriend: boolean
  isFoe: boolean
  hasTurn: boolean
  mapPosition: {
    x: number
    y: number
  }
  scale: {
    x: number
    y: number
  }
}

type OnStageChange = (tokenState: TokenState) => void

const createOnTokenStateChangeFunc = (onStateChange: OnStageChange) => {
  const onStateChangeFunc: Parameters<SceneItemsApi['onChange']>[0] = items => {
    const tokenState = generateTokenStateFromSceneItems(items)
    onStateChange(tokenState)
  }
  return onStateChangeFunc
}

const generateTokenStateFromSceneItems = (items: Item[]) => {
  // Uses the group id as a key and Token as a value
  const tokensMap: Map<string, Token[]> = new Map()

  for (const item of items) {
    //isn't an image, or isn't on the character layer
    if (!isImage(item) || item.layer !== 'CHARACTER') {
      continue
    }

    // If the token doesn't already have metadata, skip it
    if (
      item.metadata[FRIENDS_TOGGLE_METADATA_ID] === undefined &&
      item.metadata[FOES_TOGGLE_METADATA_ID] === undefined
    ) {
      continue
    }

    const token = generateImageFromToken(item)

    if (!tokensMap.has(token.groupId)) {
      tokensMap.set(token.groupId, [])
    }

    const tokenList = tokensMap.get(token.groupId) as Token[]
    tokenList.push(token)
    tokensMap.set(token.groupId, tokenList)
  }

  const tokenState: TokenState = {
    friendGroups: new Map<string, Token[]>(),
    foeGroups: new Map<string, Token[]>(),
  }

  updateTokenGroups(tokenState, tokensMap)

  return tokenState
}

function updateTokenGroups(
  tokenState: TokenState,
  tokensMap: Map<string, Token[]>,
) {
  tokensMap.forEach((tokens, groupId) => {
    const friendGroup = tokenState.friendGroups.get(groupId) || []
    const foeGroup = tokenState.foeGroups.get(groupId) || []

    tokens.forEach(token => {
      if (token.isFriend) {
        friendGroup.push(token)
        tokenState.friendGroups.set(groupId, friendGroup)
      }
      if (token.isFoe) {
        foeGroup.push(token)
        tokenState.foeGroups.set(groupId, foeGroup)
      }
    })
  })
}

const generateImageFromToken = (image: Image) => {
  const isFriend = image.metadata[FRIENDS_TOGGLE_METADATA_ID] !== undefined
  const isFoe = image.metadata[FOES_TOGGLE_METADATA_ID] !== undefined
  const hasTurn = image.metadata[TURN_TOGGLE_METADATA_ID] !== undefined

  const name = image.text.plainText ? image.text.plainText : image.name
  const groupId = generateGroupIdFromImage(image)

  const token: Token = {
    createdUserId: image.createdUserId,
    id: image.id,
    groupId: groupId,
    name: name,
    imageUrl: image.image.url,
    isVisible: image.visible,
    isFriend: isFriend,
    isFoe: isFoe,
    hasTurn: hasTurn,
    mapPosition: {
      x: image.position.x,
      y: image.position.y,
    },
    scale: {
      x: image.scale.x,
      y: image.scale.y,
    },
  }

  return token
}

export const setTokenStateListener = (onStateChange: OnStageChange) => {
  OBR.onReady(() => {
    OBR.scene.items.onChange(createOnTokenStateChangeFunc(onStateChange))
  })
}

export const getTokenState = (): Promise<TokenState> => {
  return new Promise(resolve => {
    try {
      OBR.onReady(async () => {
        const images = await OBR.scene.items.getItems()
        const tokenState = generateTokenStateFromSceneItems(images)

        resolve(tokenState)
      })
    } catch (error) {
      console.error('Error during getTokenState:', error)
      const tokenState: TokenState = {
        foeGroups: new Map<string, Token[]>(),
        friendGroups: new Map<string, Token[]>(),
      }
      resolve(tokenState)
    }
  })
}
