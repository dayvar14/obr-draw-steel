import OBR, { ContextMenuIcon } from '@owlbear-rodeo/sdk'

import {
  FOES_TOGGLE_CONTEXT_MENU_ID,
  FOES_TOGGLE_METADATA_ID,
  FRIENDS_TOGGLE_CONTEXT_MENU_ID,
  FRIENDS_TOGGLE_METADATA_ID,
  TURN_TOGGLE_CONTEXT_MENU_ID,
  TURN_TOGGLE_METADATA_ID,
} from '../config.ts'

import { createToggleClickFunc, createTurnToggleClickFunc } from './metadata.ts'

export const friendsIcons: ContextMenuIcon[] = [
  {
    icon: '/add.svg',
    label: 'Add to Friends',
    filter: {
      every: [
        { key: 'layer', value: 'CHARACTER' },
        {
          key: ['metadata', FRIENDS_TOGGLE_METADATA_ID],
          value: undefined,
        },
        {
          key: ['metadata', FOES_TOGGLE_METADATA_ID],
          value: undefined,
        },
      ],
    },
  },
  {
    icon: '/remove.svg',
    label: 'Remove from Friends',
    filter: {
      every: [
        { key: 'layer', value: 'CHARACTER' },
        {
          key: ['metadata', FOES_TOGGLE_METADATA_ID],
          value: undefined,
        },
      ],
    },
  },
]

export const foesIcons: ContextMenuIcon[] = [
  {
    icon: '/add.svg',
    label: 'Add to Foes',
    filter: {
      every: [
        { key: 'layer', value: 'CHARACTER' },
        {
          key: ['metadata', FOES_TOGGLE_METADATA_ID],
          value: undefined,
        },
        {
          key: ['metadata', FRIENDS_TOGGLE_METADATA_ID],
          value: undefined,
        },
      ],
      roles: ['GM'],
    },
  },
  {
    icon: '/remove.svg',
    label: 'Remove from Foes',
    filter: {
      every: [
        { key: 'layer', value: 'CHARACTER' },
        {
          key: ['metadata', FRIENDS_TOGGLE_METADATA_ID],
          value: undefined,
        },
      ],
      roles: ['GM'],
    },
  },
]

export const turnIcons: ContextMenuIcon[] = [
  {
    icon: '/flag_not_done.svg',
    label: 'Toggle Turn',
    filter: {
      every: [
        { key: 'layer', value: 'CHARACTER' },
        {
          key: ['metadata', TURN_TOGGLE_METADATA_ID],
          value: undefined,
        },
      ],
      some: [
        {
          key: ['metadata', FRIENDS_TOGGLE_METADATA_ID],
          value: undefined,
          operator: '!=',
          coordinator: '||',
        },
        {
          key: ['metadata', FOES_TOGGLE_METADATA_ID],
          value: undefined,
          operator: '!=',
        },
      ],
    },
  },
  {
    icon: '/flag_done.svg',
    label: 'Toggle Turn',
    filter: {
      every: [{ key: 'layer', value: 'CHARACTER' }],
      some: [
        {
          key: ['metadata', FRIENDS_TOGGLE_METADATA_ID],
          value: undefined,
          operator: '!=',
          coordinator: '||',
        },
        {
          key: ['metadata', FOES_TOGGLE_METADATA_ID],
          value: undefined,
          operator: '!=',
        },
      ],
    },
  },
]

export const setupContextMenu = () => {
  OBR.onReady(() => {
    OBR.contextMenu.create({
      id: FRIENDS_TOGGLE_CONTEXT_MENU_ID,
      icons: friendsIcons,
      onClick: createToggleClickFunc(
        FRIENDS_TOGGLE_METADATA_ID,
        TURN_TOGGLE_METADATA_ID,
      ),
    })

    OBR.contextMenu.create({
      id: FOES_TOGGLE_CONTEXT_MENU_ID,
      icons: foesIcons,
      onClick: createToggleClickFunc(
        FOES_TOGGLE_METADATA_ID,
        TURN_TOGGLE_METADATA_ID,
      ),
    })

    OBR.contextMenu.create({
      id: TURN_TOGGLE_CONTEXT_MENU_ID,
      icons: turnIcons,
      onClick: createTurnToggleClickFunc(TURN_TOGGLE_METADATA_ID),
    })
  })
}
