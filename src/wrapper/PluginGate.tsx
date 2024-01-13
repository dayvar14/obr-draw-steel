import OBR from '@owlbear-rodeo/sdk'
import React, { useEffect, useState } from 'react'

export function PluginGate({
  children,
  loadingChildren,
}: {
  children?: React.ReactNode
  loadingChildren?: React.ReactNode
}) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (OBR.isAvailable) {
      OBR.onReady(() => setReady(true))
    }
  }, [])

  if (ready) {
    return <>{children}</>
  } else {
    return <>{loadingChildren}</>
  }
}
