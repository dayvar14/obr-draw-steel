import { Metadata, Modal, Player } from '@obr'
import RefreshIcon from '@icons/refresh.svg?react'
import SettingsIcon from '@icons/settings.svg?react'
import { useContext, useEffect, useState } from 'react'
import { PlayerContext } from 'context/PlayerContext'
import { SceneContext, SceneProvider } from 'context/SceneContext'
const numberRegex = /\d/

export const Header: React.FC = () => {
  const playerContext = useContext(PlayerContext)
  const sceneContext = useContext(SceneContext)
  // headerRound is modeled as a string to allow interim blank states with the html inputs
  // once a number value is entered, the number value is persisted to the scene context
  const [headerRound, setRound] = useState<string>('0')
  const isGM = playerContext?.playerState.role === Player.PlayerRole.GM

  // necessary because on initial render, sceneContext is uninitialized.
  // this hook updates headerRound to be the persisted value, once context is ready
  useEffect(() => {
    if(sceneContext?.roundCount !== undefined) {
      setRound(`${sceneContext?.roundCount}`)
    }
  }, [sceneContext?.roundCount])

  const incrementRound = async (): Promise<void> => {
    updateRound(`${(+headerRound) + 1}`)
  }

  const updateRound = async (round: string) : Promise<void> => {
    if(!round.length) { // allows the input to be blank while the user is interacting with input
      setRound('')
      return
    }

    if(!numberRegex.test(round)) {
      return
    }

    // filters out nan or negative numbers
    if(+round < 0) {
      round = '0'
      return
    }

    // using Number constructor here strips leading zeros
    const roundCount = new Number(round)
    setRound(`${roundCount}`)
    persistRoundCount(+roundCount)
  }

  const persistRoundCount = async (round: number): Promise<void> => {
    await sceneContext?.setRoundCount(round)
  }

  return (
    <div className='app-header'>
      <div className='app-header-round-count'>
        <h1>Round</h1>
        <input type='number' value={headerRound}
          readOnly={!isGM}
          onChange={(e) => {updateRound(e.target.value)}}
          onKeyDown={(e) => e.key == 'Enter' && e.target.blur() }
          onBlur={() => !headerRound.length && updateRound('0')} // while the input is focused it can be blank. If blurred && blank, then default to 0
        />
      </div>
      <div className='app-header-icons'>
        {playerContext?.playerState.role === Player.PlayerRole.GM && (
          <>
            <SceneProvider>
              <button
                title='Refresh all turns'
                className='rounded-square-icon-button'
                onClick={() => {
                  Metadata.clearAllTurnsAndReactions()
                  incrementRound()
                }}
              >
                <RefreshIcon className='medium filled' />
              </button>
              <button
                title='Refresh all turns'
                className='rounded-square-icon-button'
                onClick={() => {
                  Modal.openSettings()
                }}
              >
                <SettingsIcon className='medium filled' />
              </button>
            </SceneProvider>
          </>
        )}
      </div>
    </div>
  )
}
