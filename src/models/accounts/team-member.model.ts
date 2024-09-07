import { isDocument, isDocumentArray, modelOptions, Prop, Ref } from '@typegoose/typegoose'
import { ProfileModel } from './profile.model'
import { TeamGroupModel } from './team-group.model'
import { TeamRoleModel } from './team-role.model'

@modelOptions({
  schemaOptions: {
    collection: 'teams.members',
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
})
export class TeamMemberModel {
  constructor(model?: Partial<TeamMemberModel>) {
    Object.assign(this, model)
  }

  @Prop({ ref: ProfileModel })
  profile: Ref<ProfileModel>

  @Prop({ type: Number, required: true, index: true })
  year: number

  @Prop({ ref: TeamRoleModel })
  roles: Ref<TeamRoleModel>[]

  @Prop({ ref: TeamGroupModel })
  group: Ref<TeamGroupModel>

  get populatedProfile() {
    return isDocument(this.profile) ? this.profile : undefined
  }

  get populatedGroup() {
    return isDocument(this.group) ? this.group : undefined
  }

  get populatedRoles() {
    return isDocumentArray(this.roles) ? this.roles : undefined
  }
}
