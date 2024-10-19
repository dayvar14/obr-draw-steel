import { SettingsMetadata } from '@data'
import { Settings } from '@obr'
import { isEqual } from 'lodash'
import React, { createContext, useEffect, useState } from 'react'

interface SettingsContextProps {
  settingsMetadata: SettingsMetadata
  setSettingsMetadata: (settings: SettingsMetadata) => void
}

const SettingsContext = createContext<SettingsContextProps | undefined>(
  undefined,
)

const SettingsProvider = ({ children }: { children?: React.ReactNode }) => {
  const [settingsMetadata, setSettingsMetadata] = useState<SettingsMetadata>()

  useEffect(() => {
    const fetchSettingsMetadata = async () => {
      const newSettingsMetadata = await Settings.getSettingsMetadata()
      setSettingsMetadata(settingsMetadata =>
        isEqual(settingsMetadata, newSettingsMetadata)
          ? settingsMetadata
          : newSettingsMetadata,
      )
    }

    Settings.onSettingsMetadataChange(newSettingsMetadata => {
      setSettingsMetadata(settingsMetadata =>
        isEqual(settingsMetadata, newSettingsMetadata)
          ? settingsMetadata
          : newSettingsMetadata,
      )
    })

    fetchSettingsMetadata()
  }, [])

  if (settingsMetadata) {
    const contextValue: SettingsContextProps = {
      settingsMetadata,
      setSettingsMetadata,
    }
    return (
      <SettingsContext.Provider value={contextValue}>
        {children}
      </SettingsContext.Provider>
    )
  } else return null
}

export { SettingsProvider, SettingsContext }
