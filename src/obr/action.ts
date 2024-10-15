import OBR from '@owlbear-rodeo/sdk'
import { APP_HEIGHT } from 'config'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Action {
  export const getHeight = async (): Promise<number> => {
    return new Promise(resolve => {
      try {
        OBR.onReady(async () => {
          const height = await OBR.action.getHeight()
          resolve(height || APP_HEIGHT)
        })
      } catch (error) {
        console.error('Error during getHeight:', error)
        resolve(APP_HEIGHT)
      }
    })
  }

  export const setHeight = async (value: number): Promise<void> => {
    return new Promise(() => {
      try {
        OBR.onReady(async () => {
          await OBR.action.setHeight(value)
        })
      } catch (error) {
        console.error('Error during setHeight:', error)
      }
    })
  }
}
