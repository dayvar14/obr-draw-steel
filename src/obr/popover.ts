import OBR from '@owlbear-rodeo/sdk'
import {
  TOKEN_OPTIONS_HEIGHT,
  TOKEN_OPTIONS_POPOVER_ID,
  TOKEN_OPTIONS_WIDTH,
} from 'config'

export module Popover {
  export const openTokenOptions = (
    groupId: string,
    offsets: {
      top: number
      left: number
    },
  ) => {
    OBR.onReady(() => {
      OBR.popover.open({
        id: TOKEN_OPTIONS_POPOVER_ID,
        url: `/popover.html?group-id=${groupId}`,
        height: TOKEN_OPTIONS_HEIGHT,
        width: TOKEN_OPTIONS_WIDTH,
        anchorReference: 'POSITION',
        transformOrigin: {
          horizontal: 'LEFT',
          vertical: 'TOP',
        },
        anchorPosition: {
          left: offsets.left,
          top: offsets.top,
        },
      })
    })
  }

  export const closeTokenOptions = (id: string) => {
    OBR.onReady(() => {
      OBR.popover.close(id)
    })
  }
}
