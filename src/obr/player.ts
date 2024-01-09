import OBR, { Math2, Player, Vector2 } from '@owlbear-rodeo/sdk'
import PlayerApi from '@owlbear-rodeo/sdk/lib/api/PlayerApi'

export enum PlayerRole {
  GM = 'GM',
  PLAYER = 'PLAYER',
}

export interface PlayerState {
  id: string
  name: string
  role: PlayerRole
  color: string
}

type OnStageChange = (playerState: PlayerState) => void

const createOnPlayerStateChangeFunc = (onStateChange: OnStageChange) => {
  const onStateChangeFunc: Parameters<PlayerApi['onChange']>[0] = player => {
    const playerState = generatePlayerStateFromPlayer(player)
    onStateChange(playerState)
  }
  return onStateChangeFunc
}

export const generatePlayerStateFromPlayer = (player: Player) => {
  const playerState: PlayerState = {
    id: player.id,
    name: player.name,
    role: player.role === 'GM' ? PlayerRole.GM : PlayerRole.PLAYER,
    color: player.color,
  }
  return playerState
}

export const setPlayerStateListener = (onStateChange: OnStageChange) => {
  OBR.onReady(() => {
    OBR.player.onChange(createOnPlayerStateChangeFunc(onStateChange))
  })
}

export const getPlayerState = (): Promise<PlayerState> => {
  return new Promise(async resolve => {
    try {
      OBR.onReady(async () => {
        const id = OBR.player.id
        const name = await OBR.player.getName()
        const role = await OBR.player.getRole()
        const color = await OBR.player.getColor()

        const playerState: PlayerState = {
          id: id,
          name: name,
          role: role === 'GM' ? PlayerRole.GM : PlayerRole.PLAYER,
          color: color,
        }

        resolve(playerState)
      })
    } catch (error) {
      console.error('Error during getPlayerState:', error)
      const playerState = {} as PlayerState
      resolve(playerState)
    }
  })
}

export const centerPlayerOnToken = async (tokenId: string) => {
  window.getSelection()?.removeAllRanges()

  await OBR.player.select([tokenId])

  // Focus on this item

  // Convert the center of the selected item to screen-space
  const bounds = await OBR.scene.items.getItemBounds([tokenId])
  const boundsAbsoluteCenter = await OBR.viewport.transformPoint(bounds.center)

  // Get the center of the viewport in screen-space
  const viewportWidth = await OBR.viewport.getWidth()
  const viewportHeight = await OBR.viewport.getHeight()
  const viewportCenter: Vector2 = {
    x: viewportWidth / 2,
    y: viewportHeight / 2,
  }

  // Offset the item center by the viewport center
  const absoluteCenter = Math2.subtract(boundsAbsoluteCenter, viewportCenter)

  // Convert the center to world-space
  const relativeCenter =
    await OBR.viewport.inverseTransformPoint(absoluteCenter)

  // Invert and scale the world-space position to match a viewport position offset
  const viewportScale = await OBR.viewport.getScale()
  const viewportPosition = Math2.multiply(relativeCenter, -viewportScale)

  await OBR.viewport.animateTo({
    scale: viewportScale,
    position: viewportPosition,
  })
}

export const selectToken = async (tokenId: string) => {
  await OBR.player.select([tokenId])
}
