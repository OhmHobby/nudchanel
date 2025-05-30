import { Injectable, Logger } from '@nestjs/common'
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm'
import { Span } from 'nestjs-otel'
import { RecruitFormAnswerEntity } from 'src/entities/recruit/recruit-form-answer.entity'
import { RecruitFormCollectionEntity } from 'src/entities/recruit/recruit-form-collection.entity'
import { RecruitFormQuestionEntity } from 'src/entities/recruit/recruit-form-question.entity'
import { RecruitRoleEntity } from 'src/entities/recruit/recruit-role.entity'
import { DataSource, In, Repository } from 'typeorm'
import { AnswerRecruitFormQuestionDto } from '../dto/answer-recruit-form-question.dto'
import { RecruitFormQuestionAnswerModel } from '../models/recruit-form-question-answer.model'

@Injectable()
export class RecruitFormService {
  private readonly logger = new Logger(RecruitFormService.name)

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(RecruitRoleEntity)
    private readonly roleRepostory: Repository<RecruitRoleEntity>,
    @InjectRepository(RecruitFormCollectionEntity)
    private readonly collectionRepostory: Repository<RecruitFormCollectionEntity>,
    @InjectRepository(RecruitFormQuestionEntity)
    private readonly questionRepostory: Repository<RecruitFormQuestionEntity>,
  ) {}

  @Span()
  async getCollectionById(collectionId: string) {
    return await this.collectionRepostory.findOneBy({ id: collectionId })
  }

  @Span()
  async getMandatoryCollections(recruitId: string) {
    const roles = await this.roleRepostory.find({
      where: { recruitId, mandatory: true },
      relations: { collection: true },
      select: { id: true, collection: { id: true, title: true } },
    })
    return roles.filter((el) => el.collection).map((el) => el.collection!)
  }

  @Span()
  async getQAByCollectionId(collectionId: string, applicantId?: string): Promise<RecruitFormQuestionAnswerModel[]> {
    const rows = await this.questionRepostory
      .createQueryBuilder('rfq')
      .select('rfq.id', 'id')
      .addSelect('rfq.question', 'question')
      .addSelect('rfq.input', 'input')
      .addSelect('rfq.options', 'options')
      .addSelect('rfq.rank', 'rank')
      .addSelect('rfa.answer', 'answer')
      .leftJoin(RecruitFormAnswerEntity, 'rfa', 'rfq.id = rfa.question_id AND rfa.applicant_id = :applicantId', {
        applicantId: applicantId ?? null,
      })
      .where('rfq.collection_id = :collectionId', { collectionId })
      .orderBy('rfq.rank')
      .getRawMany<RecruitFormQuestionAnswerModel>()
    return rows
  }

  @Span()
  async getCompletionMap(
    applicantId?: string,
    collectionIds: string[] = [],
  ): Promise<Map<string, boolean> | undefined> {
    if (!collectionIds.length || !applicantId) return undefined
    const rows = await this.questionRepostory
      .createQueryBuilder('rfq')
      .select('rfq.collection_id', 'collection_id')
      .addSelect('count(rfq.id) = count(rfa.id)', 'is_completed')
      .leftJoin(
        RecruitFormAnswerEntity,
        'rfa',
        `rfq.id = rfa.question_id AND rfa.applicant_id = :applicantId AND rfa.answer <> ''`,
        { applicantId },
      )
      .where('rfq.collection_id IN (:...collectionIds)', { collectionIds })
      .groupBy('rfq.collection_id')
      .getRawMany()
    return new Map(rows.map((row) => [row.collection_id, row.is_completed]))
  }

  updateFormAnswers(applicantId: string, questionAnswers: AnswerRecruitFormQuestionDto[]): Promise<void> {
    return this.dataSource.transaction(async (manager) => {
      const existingAnswers = await manager.getRepository(RecruitFormAnswerEntity).find({
        where: { applicantId, questionId: In(questionAnswers.map((el) => el.questionId)) },
        select: { id: true, questionId: true },
      })
      const questionIdAnswerIdMap = Object.fromEntries(existingAnswers.map((el) => [el.questionId, el.id]))
      await manager.getRepository(RecruitFormAnswerEntity).upsert(
        questionAnswers.map((el) => el.toEntity(applicantId, questionIdAnswerIdMap[el.questionId])),
        { conflictPaths: ['applicantId', 'questionId'] },
      )
    })
  }
}
