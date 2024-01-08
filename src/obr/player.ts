import OBR, { Player } from '@owlbear-rodeo/sdk'
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
