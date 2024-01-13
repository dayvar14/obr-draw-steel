// ThemeContext.tsx
import { Token } from '@obr'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useEffect,
  useState,
} from 'react'

interface TokenContextProps {
  tokenState: Token.TokenState
  setTokenState: Dispatch<SetStateAction<Token.TokenState | undefined>>
}

const TokenContext = createContext<TokenContextProps | undefined>(undefined)

const TokenProvider = ({ children }: { children?: ReactNode }) => {
  const [tokenState, setTokenState] = useState<Token.TokenState | undefined>()

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
  }, [])

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
