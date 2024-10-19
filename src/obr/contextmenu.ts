import { GroupType } from '@data'
import { Group } from './group.ts'
import OBR, { ContextMenuIcon } from '@owlbear-rodeo/sdk'

import { TOKEN_CONTEXT_MENU_ID, TOKEN_METADATA_ID } from '../config.js'
import { Token } from './tokens.ts'

const iconListsByGroupType = {} as {
  [groupType in GroupType]: ContextMenuIcon[]
}

for (const groupType of Object.values(GroupType)) {
  iconListsByGroupType[groupType] = [
    {
      icon: '/icons/add.svg',
      label: `Add from ${Group.getNameFromGroupType(groupType)}`,
      filter: {
        every: [
          { key: 'layer', value: 'CHARACTER' },
          {
            key: ['metadata', TOKEN_METADATA_ID],
            value: undefined,
          },
        ],
        roles: ['GM'],
      },
    },
    {
      icon: '/icons/remove.svg',
      label: `Remove from ${Group.getNameFromGroupType(groupType)}`,
      filter: {
        every: [
          { key: 'layer', value: 'CHARACTER' },
          {
            key: ['metadata', TOKEN_METADATA_ID, 'groupType'],
            value: groupType,
          },
        ],
        roles: ['GM'],
      },
    },
  ]
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ContextMenu {
  export const setupContextMenu = () => {
    OBR.onReady(() => {
      for (const groupType of Object.values(GroupType)) {
        const icons = iconListsByGroupType[groupType]
        OBR.contextMenu.create({
          id: `${TOKEN_CONTEXT_MENU_ID}/${groupType.toLowerCase()}`,
          icons: icons,
          onClick: Token.createToggleClickFunc(groupType),
        })
      }
    })
  }
}
