// ThemeContext.tsx
import { Token } from '@obr'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from 'react'
import { SceneContext } from './SceneContext'
import { GroupIDGenerator } from 'obr/common'

interface TokenContextProps {
  tokenState: Token.TokenState
  setTokenState: Dispatch<SetStateAction<Token.TokenState | undefined>>
}

const TokenContext = createContext<TokenContextProps | undefined>(undefined)

const TokenProvider = ({ children }: { children?: ReactNode }) => {
  const [tokenState, setTokenState] = useState<Token.TokenState | undefined>()

  const sceneMetadata = useContext(SceneContext)

  if (!sceneMetadata) {
    return null
  }

  // Set singleton options that generates group IDs. Might want to refactor this later
  GroupIDGenerator.setGroupingEnabled(sceneMetadata.settings.grouping.isEnabled)
  GroupIDGenerator.setGroupingFromAllUsers(
    sceneMetadata.settings.grouping.groupTokensFromAllUsers,
  )

  useEffect(() => {
    Token.setTokenStateListener(tokenState => {
      setTokenState(tokenState)
    })
  }, [])

  useEffect(() => {
    const fetchTokenState = async () => {
      try {
        const tokenStateValue = await Token.getTokenState()
        setTokenState(tokenStateValue)
      } catch (error) {
        console.error('Error fetching tokenState:', error)
      }
    }
    if (!tokenState) fetchTokenState()
  }, [,])

  useEffect(() => {
    const fetchTokenState = async () => {
      try {
        const tokenStateValue = await Token.getTokenState()
        setTokenState(tokenStateValue)
      } catch (error) {
        console.error('Error fetching tokenState:', error)
      }
    }
    fetchTokenState()
  }, [sceneMetadata.settings.grouping])

  if (tokenState) {
    const contextValue: TokenContextProps = {
      tokenState: tokenState as Token.TokenState,
      setTokenState,
    }

    return (
      <TokenContext.Provider value={contextValue}>
        {children}
      </TokenContext.Provider>
    )
  } else return null
}

export { TokenProvider, TokenContext }
