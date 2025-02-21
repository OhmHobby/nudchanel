import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { ProfileNameResponseModel } from 'src/accounts/models/profile-name.response.model'
import { ProfileNameMap } from 'src/accounts/types/profile-name-map.type'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { RecruitRoleModel } from './recruit-role.model'

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

  @ApiProperty({ type: RecruitRoleModel, isArray: true })
  roles: RecruitRoleModel[]

  @ApiPropertyOptional()
  interviewSlotStart?: Date | null

  @ApiPropertyOptional()
  interviewSlotEnd?: Date | null

  @ApiPropertyOptional()
  interviewedAt?: Date | null

  static fromEntity(
    entity: RecruitApplicantEntity,
    profileNameMap: ProfileNameMap = new Map(),
    completionMap?: Map<string, boolean>,
  ) {
    const profileIdHex = ObjectIdUuidConverter.toHexString(entity.profileId)
    return new RecruitApplicantModel({
      id: entity.id,
      profileId: profileIdHex,
      profileName: ProfileNameResponseModel.fromModel(profileNameMap.get(profileIdHex)),
      roles:
        entity.roles
          ?.map((role) =>
            RecruitRoleModel.fromEntity(role.role!)
              .withSelectedPriority(role.rank)
              .withIsCompleted(
                role.role?.collectionId ? (completionMap?.get(role.role?.collectionId) ?? false) : undefined,
              ),
          )
          .sort((a, b) => a.selectedPriority! - b.selectedPriority!) ?? [],
      interviewSlotStart: entity.interviewSlots?.at(0)?.startWhen ?? null,
      interviewSlotEnd: entity.interviewSlots?.at(0)?.endWhen ?? null,
      interviewedAt: entity.interviewSlots?.at(0)?.interviewAt ?? null,
    })
  }
}
