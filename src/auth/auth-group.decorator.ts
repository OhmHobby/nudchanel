import { SetMetadata } from '@nestjs/common'

export const AUTH_GROUP_KEY = 'auth_groups'
export const AuthGroups = (...groups: string[]) => SetMetadata(AUTH_GROUP_KEY, groups)
