import { Token } from '@obr'
import React, { createContext, useEffect, useState } from 'react'
import isEqual from 'lodash/isEqual'

interface TokenContextProps {
  tokensById: { [tokenIds: string]: Token.Token }
  setTokensById: (tokens: { [tokenIds: string]: Token.Token }) => void
}

const TokenContext = createContext<TokenContextProps | undefined>(undefined)

const TokenProvider = ({ children }: { children?: React.ReactNode }) => {
  const [tokensById, setTokensById] = useState<{
    [tokenIds: string]: Token.Token
  }>({})

  useEffect(() => {
    Token.setTokensListener(tokens => {
      const newTokensById = generateTokensById(tokens)
      setTokensById(tokensById =>
        isEqual(tokensById, newTokensById) ? tokensById : newTokensById,
      )
    })

    const fetchTokens = async () => {
      const newTokensById = generateTokensById(await Token.getTokens())
      setTokensById(tokensById =>
        isEqual(tokensById, newTokensById) ? tokensById : newTokensById,
      )
    }

    fetchTokens()
  }, [])

  const contextValue: TokenContextProps = {
    tokensById,
    setTokensById,
  }

  return (
    <TokenContext.Provider value={contextValue}>
      {children}
    </TokenContext.Provider>
  )
}

const generateTokensById = (
  tokens: Token.Token[],
): { [tokenIds: string]: Token.Token } => {
  const tokensById: { [tokenIds: string]: Token.Token } = {}

  for (const token of tokens) {
    tokensById[token.id] = token
  }

  return tokensById
}

export { TokenProvider, TokenContext }
