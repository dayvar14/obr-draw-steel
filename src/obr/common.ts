import { Image } from '@owlbear-rodeo/sdk'
import { v5 as uuidv5 } from 'uuid'
import { Group } from '@obr'

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

  public static generateGroupIdFromImage = (
    groupType: Group.GroupType,
    image: Image,
  ) => {
    const name = image?.text?.plainText ? image?.text?.plainText : image?.name
    const prefix = groupType.toLowerCase()

    if (!this.isGroupingEnabled) {
      return uuidv5(`${prefix}/${image.id}`, uuidv5.DNS)
    }

    if (this.isGroupingEnabled && !this.groupTokensFromAllUsers) {
      return uuidv5(
        `${prefix}/${image.createdUserId}-${image.image.url}-${name}`,
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
