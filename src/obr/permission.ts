import OBR, { Permission as OBRPermission } from '@owlbear-rodeo/sdk'
import RoomApi from '@owlbear-rodeo/sdk/lib/api/RoomApi'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Permission {
  /* Need to decouple this a bit more */
  export interface PermissionState {
    permissions: OBRPermission[]
  }

  type OnStageChange = (partyState: PermissionState) => void

  const createOnPermissionStateChangeFunc = (onStateChange: OnStageChange) => {
    const onStateChangeFunc: Parameters<
      RoomApi['onPermissionsChange']
    >[0] = permissions => {
      const permissionState: PermissionState = { permissions: permissions }

      onStateChange(permissionState)
    }
    return onStateChangeFunc
  }

  export const setPermissionStateListener = (onStateChange: OnStageChange) => {
    OBR.onReady(() => {
      OBR.room.onPermissionsChange(
        createOnPermissionStateChangeFunc(onStateChange),
      )
    })
  }

  export const getPermissionState = (): Promise<PermissionState> => {
    return new Promise(resolve => {
      try {
        OBR.onReady(async () => {
          const permissions = await OBR.room.getPermissions()
          const permissionState: PermissionState = { permissions: permissions }
          resolve(permissionState)
        })
      } catch (error) {
        console.error('Error during getPermissionState:', error)
        const playerState = {} as PermissionState
        resolve(playerState)
      }
    })
  }
}
