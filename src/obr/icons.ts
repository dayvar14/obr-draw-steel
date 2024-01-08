import { ContextMenuIcon } from '@owlbear-rodeo/sdk'
import {
  FOES_TOGGLE_METADATA_ID,
  FRIENDS_TOGGLE_METADATA_ID,
  FOES_TURN_TOGGLE_METADATA_ID,
  FRIENDS_TURN_TOGGLE_METADATA_ID,
} from '../config'

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
      ],
    },
  },
  {
    icon: '/remove.svg',
    label: 'Remove from Friends',
    filter: {
      every: [{ key: 'layer', value: 'CHARACTER' }],
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
      ],
      roles: ['GM'],
    },
  },
  {
    icon: '/remove.svg',
    label: 'Remove from Foes',
    filter: {
      every: [{ key: 'layer', value: 'CHARACTER' }],
      roles: ['GM'],
    },
  },
]

export const friendTurnIcons: ContextMenuIcon[] = [
  {
    icon: '/flag_not_done.svg',
    label: 'Toggle Friends Turn',
    filter: {
      every: [
        { key: 'layer', value: 'CHARACTER' },
        {
          key: ['metadata', FRIENDS_TURN_TOGGLE_METADATA_ID],
          value: undefined,
        },
        {
          key: ['metadata', FRIENDS_TOGGLE_METADATA_ID],
          value: undefined,
          operator: '!=',
        },
      ],
    },
  },
  {
    icon: '/flag_done.svg',
    label: 'Toggle Friends Turn',
    filter: {
      every: [
        { key: 'layer', value: 'CHARACTER' },
        {
          key: ['metadata', FRIENDS_TOGGLE_METADATA_ID],
          value: undefined,
          operator: '!=',
        },
      ],
    },
  },
]

export const foeTurnIcons: ContextMenuIcon[] = [
  {
    icon: '/flag_not_done.svg',
    label: 'Toggle Foes Turn',
    filter: {
      every: [
        { key: 'layer', value: 'CHARACTER' },
        {
          key: ['metadata', FOES_TURN_TOGGLE_METADATA_ID],
          value: undefined,
        },
        {
          key: ['metadata', FOES_TOGGLE_METADATA_ID],
          value: undefined,
          operator: '!=',
        },
      ],
      roles: ['GM'],
    },
  },
  {
    icon: '/flag_done.svg',
    label: 'Toggle Foes Turn',
    filter: {
      every: [
        { key: 'layer', value: 'CHARACTER' },
        {
          key: ['metadata', FOES_TOGGLE_METADATA_ID],
          value: undefined,
          operator: '!=',
        },
      ],
      roles: ['GM'],
    },
  },
]
