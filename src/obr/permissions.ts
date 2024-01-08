import RoomApi from '@owlbear-rodeo/sdk/lib/api/RoomApi'
import OBR, { Permission } from '@owlbear-rodeo/sdk'

export interface PermissionState {
  permissions: Permission[]
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
  return new Promise(async resolve => {
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
