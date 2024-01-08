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
