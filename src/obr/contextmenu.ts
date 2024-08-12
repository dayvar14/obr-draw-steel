import OBR, { ContextMenuIcon } from '@owlbear-rodeo/sdk'

import {
  FOES_TOGGLE_CONTEXT_MENU_ID,
  FOES_TOGGLE_METADATA_ID,
  FRIENDS_TOGGLE_CONTEXT_MENU_ID,
  FRIENDS_TOGGLE_METADATA_ID,
  REACTION_TOGGLE_CONTEXT_MENU_ID,
  REACTION_TOGGLE_METADATA_ID,
  TURN_TOGGLE_CONTEXT_MENU_ID,
  TURN_TOGGLE_METADATA_ID,
} from '../config.js'

import {
  createToggleClickFunc,
  createTurnToggleClickFunc,
  createReactionToggleClickFunc,
} from './itemmetadata.ts'

const friendsIcons: ContextMenuIcon[] = [
  {
    icon: '/icons/add.svg',
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
    icon: '/icons/remove.svg',
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

const foesIcons: ContextMenuIcon[] = [
  {
    icon: '/icons/add.svg',
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
    icon: '/icons/remove.svg',
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

const turnIcons: ContextMenuIcon[] = [
  {
    icon: '/icons/flag_filled.svg',
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
    icon: '/icons/flag_unfilled.svg',
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
  {
    icon: '/icons/flag_filled.svg',
    label: 'Toggle Turn',
    filter: {
      every: [
        { key: 'layer', value: 'CHARACTER' },
        {
          key: ['metadata', REACTION_TOGGLE_METADATA_ID],
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
    icon: '/icons/flag_unfilled.svg',
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


const reactionIcons: ContextMenuIcon[] = [
  {
    icon: '/icons/reaction_filled.svg',
    label: 'Toggle Reaction',
    filter: {
      every: [
        { key: 'layer', value: 'CHARACTER' },
        {
          key: ['metadata', REACTION_TOGGLE_METADATA_ID],
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
    icon: '/icons/reaction_unfilled.svg',
    label: 'Toggle Reaction',
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

export module ContextMenu {
  export const setupContextMenu = () => {
    OBR.onReady(() => {
      OBR.contextMenu.create({
        id: FRIENDS_TOGGLE_CONTEXT_MENU_ID,
        icons: friendsIcons,
        onClick: createToggleClickFunc(
          FRIENDS_TOGGLE_METADATA_ID,
          TURN_TOGGLE_METADATA_ID,
          REACTION_TOGGLE_METADATA_ID,
        ),
      })

      OBR.contextMenu.create({
        id: FOES_TOGGLE_CONTEXT_MENU_ID,
        icons: foesIcons,
        onClick: createToggleClickFunc(
          FOES_TOGGLE_METADATA_ID,
          TURN_TOGGLE_METADATA_ID,
          REACTION_TOGGLE_METADATA_ID,
        ),
      })

      OBR.contextMenu.create({
        id: TURN_TOGGLE_CONTEXT_MENU_ID,
        icons: turnIcons,
        onClick: createTurnToggleClickFunc(TURN_TOGGLE_METADATA_ID),
      })

      OBR.contextMenu.create({
        id: REACTION_TOGGLE_CONTEXT_MENU_ID,
        icons: reactionIcons,
        onClick: createReactionToggleClickFunc(REACTION_TOGGLE_METADATA_ID),
      })
    })
  }
}
