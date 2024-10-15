import { Settings } from '@obr'
import OBR from '@owlbear-rodeo/sdk'
import React, { createContext, useEffect, useState } from 'react'

interface SettingsContextProps {
  settingsMetadata: Settings.SettingsMetadata
  settings: Settings.Settings
  setSettings: (settings: Settings.Settings) => void
}

const SettingsContext = createContext<SettingsContextProps | undefined>(
  undefined,
)

const SettingsProvider = ({
  children,
  loadingChildren,
}: {
  children?: React.ReactNode
  loadingChildren?: React.ReactNode
}) => {
  const [settingsReady, setSettingsReady] = useState(false)
  const [settingsMetadata, setSettingsMetadata] =
    useState<Settings.SettingsMetadata>()
  const [settings, setLocalSettings] = useState<Settings.Settings>()

  useEffect(() => {
    OBR.scene.isReady().then(ready => {
      setSettingsReady(ready)
    })

    OBR.scene.onReadyChange(ready => {
      setSettingsReady(ready)
    })
  }, [])

  useEffect(() => {
    const fetchSettingsMetadata = async () => {
      const settingsMetadata = await Settings.getSettingsMetadata()
      setSettingsMetadata(settingsMetadata)
    }

    if (settingsReady) {
      Settings.onSettingsMetadataChange(metadata => {
        setSettingsMetadata(metadata)
      })

      fetchSettingsMetadata()
    }
  }, [settingsReady])

  useEffect(() => {
    if (settingsMetadata) {
      setLocalSettings(settingsMetadata.settings)
    }
  }, [settingsMetadata])

  const setSettings = (settings: Settings.Settings) => {
    Settings.updateSettings(settings)
  }

  useEffect(() => {
    if (settingsMetadata) {
      setLocalSettings(settingsMetadata.settings)
    }
  }, [settingsMetadata])

  if (settingsMetadata) {
    const contextValue: SettingsContextProps = {
      settingsMetadata,
      settings: settings as Settings.Settings,
      setSettings,
    }
    return (
      <SettingsContext.Provider value={contextValue}>
        {children}
      </SettingsContext.Provider>
    )
  } else return <>{loadingChildren}</>
}

export { SettingsProvider, SettingsContext }
