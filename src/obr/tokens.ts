import { GroupType, TokenMetadata } from '@data'
import OBR, { ContextMenuItem, Image, isImage, Item } from '@owlbear-rodeo/sdk'
import SceneItemsApi from '@owlbear-rodeo/sdk/lib/api/scene/SceneItemsApi'
import { v5 as uuidv5 } from 'uuid'

import { APP_VERSION, TOKEN_METADATA_ID } from '../config'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Token {
  export interface Token {
    tokenMetadata: TokenMetadata
    createdUserId: string
    id: string
    name: string
    plainTextName: string
    imageUrl: string
    isVisible: boolean
    mapPosition: {
      x: number
      y: number
    }
  }

  type OnStateChange = (tokens: Token.Token[]) => void
  const createOnTokenStateChangeFunc = (onStateChange: OnStateChange) => {
    const onStateChangeFunc: Parameters<
      SceneItemsApi['onChange']
    >[0] = items => {
      const tokens = generateTokensFromItems(items)
      onStateChange(tokens)
    }
    return onStateChangeFunc
  }

  export const setTokensListener = (onStateChange: OnStateChange) => {
    OBR.onReady(() => {
      OBR.scene.items.onChange(createOnTokenStateChangeFunc(onStateChange))
    })
  }

  export const clearTokens = (tokens: Token.Token[]) => {
    const tokenIds = tokens.map(token => token.id)
    OBR.scene.items.updateItems(tokenIds, items => {
      for (const item of items) {
        delete item.metadata[TOKEN_METADATA_ID]
      }
    })
  }

  export const clearTokensById = (tokenIds: string[]) => {
    OBR.scene.items.updateItems(tokenIds, items => {
      for (const item of items) {
        delete item.metadata[TOKEN_METADATA_ID]
      }
    })
  }

  export const getTokens = (): Promise<Token.Token[]> => {
    return new Promise(resolve => {
      try {
        OBR.onReady(async () => {
          const images = await OBR.scene.items.getItems((item: Item) =>
            obrItemIsValidToken(item),
          )
          const tokens = generateTokensFromItems(images)

          resolve(tokens)
        })
      } catch (error) {
        console.error('Error during getTokens:', error)

        resolve([])
      }
    })
  }

  export const getTokensById = async (
    tokenIds: string[],
  ): Promise<Token.Token[]> => {
    const tokens = generateTokensFromItems(
      await OBR.scene.items.getItems(tokenIds),
    )

    return tokens
  }

  export const updateTokens = (token: Token.Token[]): void => {
    const tokenMap = new Map<string, Token.Token>()
    for (const t of token) {
      tokenMap.set(t.id, t)
    }

    OBR.scene.items.updateItems(
      token.map(token => token.id),
      items => {
        if (items.length === 0) return
        for (const item of items) {
          const token = tokenMap.get(item.id)
          if (!token) return
          ;(item as Image).text.plainText = token.plainTextName
          ;(item as Image).metadata[TOKEN_METADATA_ID] = token.tokenMetadata
        }
      },
    )
  }

  export const updateTokenMetadata = (token: Token.Token): void => {
    OBR.scene.items.updateItems([token.id], items => {
      if (items.length === 0) return
      ;(items[0] as Image).text.plainText = token.plainTextName
    })
  }

  export const createToggleClickFunc = (groupType: GroupType) => {
    const ToggleClickFunc: ContextMenuItem['onClick'] = context => {
      const toggleEnabled = context.items.every(
        item => item.metadata[TOKEN_METADATA_ID] === undefined,
      )

      let subGroupId = uuidv5(`${new Date().toISOString()}`, uuidv5.DNS)

      if (toggleEnabled) {
        OBR.scene.items.updateItems(context.items, items => {
          for (const item of items) {
            const tokenMetadata: TokenMetadata = {
              groupType: groupType,
              subGroupId: subGroupId,
              appVersion: APP_VERSION,
            }
            item.metadata[TOKEN_METADATA_ID] = tokenMetadata
          }
        })
      } else {
        OBR.scene.items.updateItems(context.items, items => {
          for (const item of items) {
            delete item.metadata[TOKEN_METADATA_ID]
          }
        })
      }
    }
    return ToggleClickFunc
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const obrItemIsValidToken = (item: any) => {
  return (
    isImage(item) &&
    item.layer === 'CHARACTER' &&
    item.metadata[TOKEN_METADATA_ID] !== undefined
  )
}

const generateTokensFromItems = (items: Item[]) => {
  // Uses the group id as a key and Token as a value
  const tokens: Token.Token[] = []

  for (const item of items) {
    if (!obrItemIsValidToken(item)) {
      continue
    }

    const token = generateTokenFromValidItem(item)

    tokens.push(token)
  }

  return tokens
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const generateTokenFromValidItem = (item: any): Token.Token => {
  if (!obrItemIsValidToken(item))
    throw Error('Cannot parse item. Is invalid token')

  const image = item as Image
  const tokenMetadata = image.metadata[TOKEN_METADATA_ID] as TokenMetadata
  const token = {
    tokenMetadata: tokenMetadata,
    createdUserId: image.createdUserId,
    id: image.id,
    name: image.name,
    plainTextName: image.text.plainText,
    imageUrl: image.image.url,
    isVisible: image.visible,
    mapPosition: {
      x: image.position.x,
      y: image.position.y,
    },
  }

  return token
}
