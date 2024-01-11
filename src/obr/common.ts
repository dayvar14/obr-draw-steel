import { Image } from '@owlbear-rodeo/sdk'
import { v5 as uuidv5 } from 'uuid'
import {
  FOES_GROUP_ID_PREFIX,
  FRIENDS_GROUP_ID_PREFIX,
  FRIENDS_TOGGLE_METADATA_ID,
} from '../config'

export const generateGroupIdFromImage = (image: Image) => {
  const isFriend = image.metadata[FRIENDS_TOGGLE_METADATA_ID] !== undefined
  const name = image.text.plainText ? image.text.plainText : image.name
  const prefix = isFriend ? FRIENDS_GROUP_ID_PREFIX : FOES_GROUP_ID_PREFIX

  return uuidv5(prefix + image.image.url + name, uuidv5.DNS)
}
