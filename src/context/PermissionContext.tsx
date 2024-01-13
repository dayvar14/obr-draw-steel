// ThemeContext.tsx
import { Permission } from '@obr'
import { createContext, ReactNode, useEffect, useState } from 'react'

interface PermissionContextProps {
  permissionState: Permission.PermissionState
  setPermissionState: React.Dispatch<
    React.SetStateAction<Permission.PermissionState | undefined>
  >
}

const PermissionContext = createContext<PermissionContextProps | undefined>(
  undefined,
)

const PermissionProvider = ({ children }: { children?: ReactNode }) => {
  const [permissionState, setPermissionState] = useState<
    Permission.PermissionState | undefined
  >()

  useEffect(() => {
    Permission.setPermissionStateListener(permissionState => {
      setPermissionState(permissionState)
    })
  }, [])

  useEffect(() => {
    const fetchPermissionState = async () => {
      try {
        const permissionStateValue = await Permission.getPermissionState()
        setPermissionState(permissionStateValue)
      } catch (error) {
        console.error('Error fetching permissionState:', error)
      }
    }

    if (!permissionState) fetchPermissionState()
  }, [])

  if (permissionState) {
    const contextValue: PermissionContextProps = {
      permissionState: permissionState as Permission.PermissionState,
      setPermissionState,
    }

    return (
      <PermissionContext.Provider value={contextValue}>
        {children}
      </PermissionContext.Provider>
    )
  } else return null
}

export { PermissionProvider, PermissionContext }
