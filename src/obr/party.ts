import { Player } from './player'
import PartyApi from '@owlbear-rodeo/sdk/lib/api/PartyApi'
import OBR, { Player as OBRPlayer } from '@owlbear-rodeo/sdk'

export module Party {
  export interface PartyState {
    playerStates: Player.PlayerState[]
  }
  type OnStageChange = (partyState: PartyState) => void
  const createOnPartyStateChangeFunc = (onStateChange: OnStageChange) => {
    const onStateChangeFunc: Parameters<PartyApi['onChange']>[0] = players => {
      const partyState = generatePartyStateFromPlayers(players)
      onStateChange(partyState)
    }
    return onStateChangeFunc
  }

  const generatePartyStateFromPlayers = (players: OBRPlayer[]) => {
    let partyState = {} as PartyState
    for (const player of players) {
      const playerStates: Player.PlayerState[] = []

      const playerState = Player.generatePlayerStateFromPlayer(player)
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
}
