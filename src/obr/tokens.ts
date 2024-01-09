import OBR, { Image, Item, isImage } from '@owlbear-rodeo/sdk'
import SceneItemsApi from '@owlbear-rodeo/sdk/lib/api/scene/SceneItemsApi'
import {
  FOES_TOGGLE_METADATA_ID,
  FRIENDS_TOGGLE_METADATA_ID,
  TURN_TOGGLE_METADATA_ID,
} from '../config'

export interface TokenState {
  friends: Token[]
  foes: Token[]
}

export interface Token {
  createdUserId: string
  id: string
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
  let friends: Token[] = []
  let foes: Token[] = []

  for (const item of items) {
    //isn't an image, or isn't on the character layer
    if (!isImage(item) || item.layer !== 'CHARACTER') {
      continue
    }

    if (
      !item.metadata.hasOwnProperty(FRIENDS_TOGGLE_METADATA_ID) &&
      !item.metadata.hasOwnProperty(FOES_TOGGLE_METADATA_ID)
    ) {
      continue
    }

    const image = item as Image

    const token = generateImageFromToken(image)

    if (token.isFriend) {
      friends.push(token)
    }

    if (token.isFoe) {
      foes.push(token)
    }
  }

  const tokenState: TokenState = {
    friends: friends,
    foes: foes,
  }
  return tokenState
}

const generateImageFromToken = (image: Image) => {
  const isFriend = image.metadata.hasOwnProperty(FRIENDS_TOGGLE_METADATA_ID)
  const isFoe = image.metadata.hasOwnProperty(FOES_TOGGLE_METADATA_ID)
  const hasTurn = image.metadata.hasOwnProperty(TURN_TOGGLE_METADATA_ID)

  const token: Token = {
    createdUserId: image.createdUserId,
    id: image.id,
    name: image.name,
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
  return new Promise(async resolve => {
    try {
      OBR.onReady(async () => {
        const images = await OBR.scene.items.getItems()
        const tokenState = generateTokenStateFromSceneItems(images)

        resolve(tokenState)
      })
    } catch (error) {
      console.error('Error during getTokenState:', error)
      const tokenState = { foes: [], friends: [] } as TokenState
      resolve(tokenState)
    }
  })
}
