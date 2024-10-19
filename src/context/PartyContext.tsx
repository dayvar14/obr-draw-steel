// ThemeContext.tsx
import { Party } from '@obr'
import { createContext, ReactNode, useEffect, useState } from 'react'

interface PartyContextProps {
  partyState: Party.PartyState
  setPartyState: React.Dispatch<
    React.SetStateAction<Party.PartyState | undefined>
  >
}

const PartyContext = createContext<PartyContextProps | undefined>(undefined)

const PartyProvider = ({ children }: { children?: ReactNode }) => {
  const [partyState, setPartyState] = useState<Party.PartyState | undefined>()

  useEffect(() => {
    Party.setPartyStateListener(newPartyState => {
      setPartyState(partyState =>
        partyState === newPartyState ? partyState : newPartyState,
      )
    })
  }, [])

  useEffect(() => {
    const fetchPartyState = async () => {
      try {
        const newPartyState = await Party.getPartyState()
        setPartyState(partyState =>
          partyState === newPartyState ? partyState : newPartyState,
        )
      } catch (error) {
        console.error('Error fetching partyState:', error)
      }
    }

    if (!partyState) fetchPartyState()
  }, [])

  if (partyState) {
    const contextValue: PartyContextProps = {
      partyState: partyState as Party.PartyState,
      setPartyState,
    }

    return (
      <PartyContext.Provider value={contextValue}>
        {children}
      </PartyContext.Provider>
    )
  } else return null
}

export { PartyProvider, PartyContext }
