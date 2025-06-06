import { ConflictException, Injectable, Logger } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Span } from 'nestjs-otel'
import { ProfileNameService } from 'src/accounts/profile/profile-name.service'
import { RecruitApplicantRoleEntity } from 'src/entities/recruit/recruit-applicant-role.entity'
import { RecruitApplicantEntity } from 'src/entities/recruit/recruit-applicant.entity'
import { ObjectIdUuidConverter } from 'src/helpers/objectid-uuid-converter'
import { Repository } from 'typeorm'
import { RecruitFormService } from '../form/recruit-form.service'
import { RecruitApplicantModel } from '../models/recruit-applicant.model'

@Injectable()
export class RecruitApplicantService {
  private readonly logger = new Logger(RecruitApplicantService.name)

  constructor(
    @InjectRepository(RecruitApplicantEntity)
    private readonly applicantRepostory: Repository<RecruitApplicantEntity>,
    @InjectRepository(RecruitApplicantRoleEntity)
    private readonly applicantRoleRepostory: Repository<RecruitApplicantRoleEntity>,
    private readonly profileNameService: ProfileNameService,
    private readonly recruitFormService: RecruitFormService,
  ) {}

  async findOne(applicantId?: string, settingId?: string, profileId?: string): Promise<RecruitApplicantEntity | null> {
    if (!applicantId && !(settingId && profileId)) return null
    const result = await this.find(applicantId, settingId, profileId)
    return result.at(0) ?? null
  }

  @Span()
  async find(applicantId?: string, settingId?: string, profileId?: string): Promise<RecruitApplicantEntity[]> {
    return await this.applicantRepostory.find({
      where: { id: applicantId, recruitId: settingId, profileId },
      relations: { roles: { role: true }, interviewSlots: true },
      select: {
        id: true,
        profileId: true,
        recruitId: true,
        roles: { id: true, role: { id: true, name: true, collectionId: true }, rank: true },
        interviewSlots: { id: true, startWhen: true, endWhen: true, interviewAt: true },
      },
    })
  }

  async getRecruitApplicantModels(
    applicantId?: string,
    settingId?: string,
    profileId?: string,
  ): Promise<RecruitApplicantModel[]> {
    const applicants = await this.find(applicantId, settingId, profileId)
    const profileNameMap = await this.profileNameService.getProfilesNameMap(
      applicants.map((el) => ObjectIdUuidConverter.toObjectId(el.profileId)),
      'th',
    )
    return applicants.map((applicant) => RecruitApplicantModel.fromEntity(applicant, profileNameMap))
  }

  async getRecruitApplicantModelWithInfo(applicant: RecruitApplicantEntity): Promise<RecruitApplicantModel> {
    const [completionMap, profileNameMap] = await Promise.all([
      this.recruitFormService.getCompletionMap(
        applicant.id,
        applicant.roles?.map((role) => role.role?.collectionId).filter((el) => typeof el === 'string'),
      ),
      this.profileNameService.getProfilesNameMap([ObjectIdUuidConverter.toObjectId(applicant.profileId)], 'th'),
    ])
    return RecruitApplicantModel.fromEntity(applicant, profileNameMap, completionMap)
  }

  async createApplicant(settingId: string, profileId: string): Promise<RecruitApplicantEntity> {
    const currentApplicant = await this.findOne(settingId, profileId)
    this.logger.log(`Creating applicant for profile ${profileId} recruit ${settingId} (${!!currentApplicant})`)
    if (currentApplicant) throw new ConflictException()
    const applicant = new RecruitApplicantEntity({ profileId, recruitId: settingId })
    await this.applicantRepostory.insert(applicant)
    return applicant
  }

  async getSelectedRoleIds(applicantId: string): Promise<string[]> {
    const roles = await this.applicantRoleRepostory.find({
      where: { applicantId },
      select: { id: true, roleId: true },
    })
    return roles.map((el) => el.roleId)
  }
}
