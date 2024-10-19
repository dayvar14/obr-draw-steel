// ThemeContext.tsx
import { Permission } from '@obr'
import { isEqual } from 'lodash'
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
    Permission.setPermissionStateListener(newPermissionState => {
      setPermissionState(permissionState =>
        isEqual(permissionState, newPermissionState)
          ? permissionState
          : newPermissionState,
      )
    })
  }, [])

  useEffect(() => {
    const fetchPermissionState = async () => {
      try {
        const newPermissionState = await Permission.getPermissionState()
        setPermissionState(permissionState =>
          isEqual(permissionState, newPermissionState)
            ? permissionState
            : newPermissionState,
        )
      } catch (error) {
        console.error('Error fetching permissionState:', error)
      }
    }

    if (!permissionState) fetchPermissionState()
  })

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
