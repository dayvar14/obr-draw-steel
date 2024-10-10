import OBR from '@owlbear-rodeo/sdk'
import { SETTINGS_HEIGHT, SETTINGS_MODAL_ID, SETTINGS_WIDTH } from 'config'

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Modal {
  export const openSettings = () => {
    OBR.onReady(() => {
      OBR.modal.open({
        id: SETTINGS_MODAL_ID,
        url: '/settings.html',
        height: SETTINGS_HEIGHT,
        width: SETTINGS_WIDTH,
      })
    })
  }

  export const closeSettings = () => {
    OBR.onReady(() => {
      OBR.modal.close(SETTINGS_MODAL_ID)
    })
  }
}
