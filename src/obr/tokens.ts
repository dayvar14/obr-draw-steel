import OBR, { Image, Item, isImage } from '@owlbear-rodeo/sdk'
import SceneItemsApi from '@owlbear-rodeo/sdk/lib/api/scene/SceneItemsApi'

import {
  FOES_TOGGLE_METADATA_ID,
  FRIENDS_TOGGLE_METADATA_ID,
  TURN_TOGGLE_METADATA_ID,
} from '../config'
import { generateGroupIdFromImage } from './common'

export module Token {
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
    tokenType?: TokenType
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

  export enum TokenType {
    FRIEND = 'FRIEND',
    FOE = 'FOE',
  }

  type OnStageChange = (tokenState: TokenState) => void

  const createOnTokenStateChangeFunc = (onStateChange: OnStageChange) => {
    const onStateChangeFunc: Parameters<
      SceneItemsApi['onChange']
    >[0] = items => {
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

      const token = generateTokenFromImage(item)

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
        if (token.tokenType === TokenType.FRIEND) {
          friendGroup.push(token)
          tokenState.friendGroups.set(groupId, friendGroup)
        }
        if (token.tokenType === TokenType.FOE) {
          foeGroup.push(token)
          tokenState.foeGroups.set(groupId, foeGroup)
        }
      })
    })
  }

  export const splitTokenGroups = async (
    groupId: string,
    groupSize: number,
  ) => {
    const tokens = await getTokensFromGroupId(groupId)

    if (tokens.length === 0) {
      return
    }

    let index = 0

    OBR.scene.items.updateItems(
      item =>
        (item.metadata[FOES_TOGGLE_METADATA_ID] !== undefined ||
          item.metadata[FRIENDS_TOGGLE_METADATA_ID] !== undefined) &&
        isImage(item) &&
        groupId === generateGroupIdFromImage(item),
      images => {
        images.forEach((image: Image) => {
          const name = image.text.plainText ? image.text.plainText : image.name
          image.text.plainText = name + getTokenGroupSuffix(index, groupSize)
          index++
        })
      },
    )
  }

  // group size = 1
  // index = 25 (26th token)

  function getTokenGroupSuffix(index: number, groupSize: number) {
    let suffix = ' '
    let charCount = Math.floor(index / groupSize / 26)

    for (let i = 0; i <= charCount; i++) {
      const asciiA = 'A'.charCodeAt(0)

      const capitalizedLetter = String.fromCharCode(
        asciiA + ((index / groupSize) % 26),
      )
      suffix += capitalizedLetter
    }

    return suffix
  }

  export const getTokensFromGroupId = (groupId: string): Promise<Token[]> => {
    return new Promise(resolve => {
      try {
        OBR.onReady(async () => {
          const items = await OBR.scene.items.getItems(
            (item: Item) =>
              isImage(item) &&
              item.layer === 'CHARACTER' &&
              (item.metadata[FOES_TOGGLE_METADATA_ID] !== undefined ||
                item.metadata[FRIENDS_TOGGLE_METADATA_ID] !== undefined),
          )

          const tokens: Token[] = []

          for (const item of items) {
            const token = generateTokenFromImage(item as Image)

            if (token.groupId !== groupId) {
              continue
            }

            tokens.push(token)
          }

          resolve(tokens)
        })
      } catch (error) {
        console.error('Error during getTokensFromGroupId:', error)
        resolve([] as Token[])
      }
    })
  }

  const generateTokenFromImage = (image: Image) => {
    const tokenType =
      image.metadata[FRIENDS_TOGGLE_METADATA_ID] !== undefined
        ? TokenType.FRIEND
        : TokenType.FOE
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
      tokenType: tokenType,
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
          const images = await OBR.scene.items.getItems(
            (item: Item) =>
              isImage(item) &&
              item.layer === 'CHARACTER' &&
              (item.metadata[FOES_TOGGLE_METADATA_ID] !== undefined ||
                item.metadata[FRIENDS_TOGGLE_METADATA_ID] !== undefined),
          )
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
}
