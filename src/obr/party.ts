import { PlayerState, generatePlayerStateFromPlayer } from './player'
import PartyApi from '@owlbear-rodeo/sdk/lib/api/PartyApi'
import OBR, { Player } from '@owlbear-rodeo/sdk'

export interface PartyState {
  playerStates: PlayerState[]
}

type OnStageChange = (partyState: PartyState) => void

const createOnPartyStateChangeFunc = (onStateChange: OnStageChange) => {
  const onStateChangeFunc: Parameters<PartyApi['onChange']>[0] = players => {
    const partyState = generatePartyStateFromPlayers(players)
    onStateChange(partyState)
  }
  return onStateChangeFunc
}

const generatePartyStateFromPlayers = (players: Player[]) => {
  let partyState = {} as PartyState
  for (const player of players) {
    const playerStates: PlayerState[] = []

    const playerState = generatePlayerStateFromPlayer(player)
    playerStates.push(playerState)

    partyState = {
      playerStates: playerStates,
    }
  }

  return partyState
}

export const setPartyStateListener = (onStateChange: OnStageChange) => {
  OBR.onReady(() => {
    OBR.party.onChange(createOnPartyStateChangeFunc(onStateChange))
  })
}

export const getPartyState = (): Promise<PartyState> => {
  return new Promise(async resolve => {
    try {
      OBR.onReady(async () => {
        const players = await OBR.party.getPlayers()

        const partyState = generatePartyStateFromPlayers(players)

        resolve(partyState)
      })
    } catch (error) {
      console.error('Error during getPartyState:', error)
      const playerState = { playerStates: [] }
      resolve(playerState)
    }
  })
}
