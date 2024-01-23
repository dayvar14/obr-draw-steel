import { Image } from '@owlbear-rodeo/sdk'
import { v5 as uuidv5 } from 'uuid'
import {
  FOES_GROUP_ID_PREFIX,
  FRIENDS_GROUP_ID_PREFIX,
  FRIENDS_TOGGLE_METADATA_ID,
} from '../config'

export class GroupIDGenerator {
  private static instance: GroupIDGenerator | null = null
  private static isGroupingEnabled: boolean = true
  private static groupTokensFromAllUsers: boolean = true

  private constructor() {}

  public static getInstance(): GroupIDGenerator {
    if (!GroupIDGenerator.instance) {
      GroupIDGenerator.instance = new GroupIDGenerator()
    }

    return GroupIDGenerator.instance
  }

  static generateGroupIdFromImage = (image: Image) => {
    const isFriend = image.metadata[FRIENDS_TOGGLE_METADATA_ID] !== undefined
    const name = image.text.plainText ? image.text.plainText : image.name
    const prefix = isFriend ? FRIENDS_GROUP_ID_PREFIX : FOES_GROUP_ID_PREFIX

    if (!this.isGroupingEnabled) {
      return uuidv5(prefix + image.id, uuidv5.DNS)
    }

    if (this.isGroupingEnabled && !this.groupTokensFromAllUsers) {
      return uuidv5(
        prefix + image.createdUserId + image.image.url + name,
        uuidv5.DNS,
      )
    }

    return uuidv5(prefix + image.image.url + name, uuidv5.DNS)
  }

  static getGroupingEnabled() {
    return this.isGroupingEnabled
  }

  static setGroupingEnabled(isEnabled: boolean) {
    this.isGroupingEnabled = isEnabled
  }

  static setGroupingFromAllUsers(isFromAllUsers: boolean) {
    this.groupTokensFromAllUsers = isFromAllUsers
  }

  static getGroupingFromAllUsers() {
    return this.groupTokensFromAllUsers
  }
}
