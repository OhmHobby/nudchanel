import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProfileNameResponseModel } from 'src/accounts/models/profile-name.response.model'
import { ProfileNameMap } from 'src/accounts/types/profile-name-map.type'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { RecruitApplicantRoleModel } from './recruit-applicant-role.model'
import { RecruitInterviewSlotModel } from './recruit-interview-slot.model'

export class RecruitApplicantModel {
  constructor(model?: Partial<RecruitApplicantModel>) {
    Object.assign(this, model)
  }

  @ApiProperty()
  id: string

  @ApiProperty()
  profileId: string

  @ApiPropertyOptional({ type: ProfileNameResponseModel })
  profileName?: ProfileNameResponseModel

  @ApiProperty({ type: RecruitApplicantRoleModel, isArray: true })
  roles: RecruitApplicantRoleModel[]

  @ApiProperty()
  interview?: RecruitInterviewSlotModel

  static fromEntity(
    entity: RecruitApplicantEntity,
    profileNameMap: ProfileNameMap = new Map(),
    completionMap?: Map<string, boolean>,
    isAnnounce = false,
  ) {
    const profileIdHex = ObjectIdUuidConverter.toHexString(entity.profileId)
    return new RecruitApplicantModel({
      id: entity.id,
      profileId: profileIdHex,
      profileName: ProfileNameResponseModel.fromModel(profileNameMap.get(profileIdHex)),
      roles:
        entity.roles
          ?.map((role) =>
            RecruitApplicantRoleModel.fromEntity(role, isAnnounce)
              .withSelectedPriority(role.rank)
              .withIsCompleted(
                role.role?.collectionId ? (completionMap?.get(role.role?.collectionId) ?? false) : undefined,
              ),
          )
          .sort((a, b) => a.selectedPriority! - b.selectedPriority!) ?? [],
      interview: entity.interviewSlots
        ?.slice(0)
        .map((el) => RecruitInterviewSlotModel.fromEntity(el))
        ?.at(0),
    })
  }
}
