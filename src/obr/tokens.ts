import { kmeans } from 'ml-kmeans'
import OBR, { Image, isImage, Item } from '@owlbear-rodeo/sdk'
import SceneItemsApi from '@owlbear-rodeo/sdk/lib/api/scene/SceneItemsApi'
import { GroupIDGenerator } from './common'

import {
  FOES_TOGGLE_METADATA_ID,
  FRIENDS_TOGGLE_METADATA_ID,
  TURN_TOGGLE_METADATA_ID,
} from '../config'

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

  export enum GroupSplittingMode {
    CLOSEST = 'CLOSEST',
    RANDOM = 'RANDOM',
    STANDARD = 'STANDARD',
  }

  export const splitTokenGroups = async (
    groupId: string,
    groupSize: number,
    groupSplittingMode: GroupSplittingMode,
  ) => {
    const tokens = await getTokensFromGroupId(groupId)

    if (tokens.length === 0) {
      return
    }

    OBR.scene.items.updateItems(
      item =>
        (item.metadata[FOES_TOGGLE_METADATA_ID] !== undefined ||
          item.metadata[FRIENDS_TOGGLE_METADATA_ID] !== undefined) &&
        isImage(item) &&
        groupId === GroupIDGenerator.generateGroupIdFromImage(item),
      items => {
        const images = items as Image[]
        if (groupSplittingMode === GroupSplittingMode.CLOSEST) {
          kMeansClusteringSplittingAlgorithm(images, groupSize)
        } else if (groupSplittingMode === GroupSplittingMode.RANDOM) {
          randomSplittingAlgorithm(images, groupSize)
        } else {
          standardSplittingAlgorithm(images, groupSize)
        }
      },
    )
  }

  export function kMeansClusteringSplittingAlgorithm(
    images: Image[],
    groupSize: number,
  ) {
    const data = images.map(image => [image.position.x, image.position.y])

    const { clusters } = kmeans(data, groupSize, {})

    // Group images based on the clustering result
    const imageGroups: Image[][] = Array.from({ length: groupSize }, () => [])

    clusters.forEach((clusterIndex, imageIndex) => {
      const image = images[imageIndex]
      imageGroups[clusterIndex].push(image)
    })

    // Adjust so that all groups are as close to the same size as possible, with remaining images in the last group
    const adjustedImageGroups: Image[][] = []

    for (let i = 0; i < imageGroups.length - 1; i++) {
      while (imageGroups[i].length > groupSize) {
        const image = imageGroups[i].pop()
        imageGroups[i + 1].unshift(image!)
      }
      adjustedImageGroups.push([...imageGroups[i]]) // Add a copy of the adjusted group
    }

    // Add the remaining images to the last group
    adjustedImageGroups.push([...imageGroups[imageGroups.length - 1]])

    const imageList = adjustedImageGroups.reduce(
      (acc, currGroup) => [...acc, ...currGroup],
      [],
    )

    console.log(adjustedImageGroups)

    standardSplittingAlgorithm(imageList, groupSize)
  }

  function randomSplittingAlgorithm(images: Image[], groupSize: number) {
    const shuffledImages = images
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)

    standardSplittingAlgorithm(shuffledImages, groupSize)
  }

  function standardSplittingAlgorithm(images: Image[], groupSize: number) {
    let index = 0

    images.forEach((image: Image) => {
      const name = image.text.plainText ? image.text.plainText : image.name
      image.text.plainText = name + getGroupSuffix(index, groupSize)
      index++
    })
  }

  function getGroupSuffix(index: number, groupSize: number) {
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
    const groupId = GroupIDGenerator.generateGroupIdFromImage(image)

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
