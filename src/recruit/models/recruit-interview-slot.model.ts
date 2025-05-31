import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { RecruitInterviewSlotEntity } from 'src/entities/recruit/recruit-interview-slot.entity'

export class RecruitInterviewSlotModel {
  static readonly separator = '-'

  private static readonly interval = 60000 // 60s

  private static readonly base = 36

  constructor(model?: Partial<RecruitInterviewSlotModel>) {
    Object.assign(this, model)
  }

  @ApiProperty({ type: String })
  @Expose()
  get refId() {
    return RecruitInterviewSlotModel.refId(this.start, this.end)
  }

  @ApiProperty()
  start: Date

  @ApiProperty()
  end: Date

  @ApiPropertyOptional()
  interviewedAt?: Date

  static refId(start: Date, end: Date) {
    return `${this.toBase36(start)}${this.separator}${this.toBase36(end)}`
  }

  static fromRefId(refId: string): RecruitInterviewSlotModel {
    const [start, end] = refId.split(this.separator).map((el) => this.toDate(el))
    return new RecruitInterviewSlotModel({ start, end })
  }

  static fromEntity(entity: RecruitInterviewSlotEntity): RecruitInterviewSlotModel {
    return new RecruitInterviewSlotModel({
      start: entity.startWhen,
      end: entity.endWhen,
      interviewedAt: entity.interviewAt ?? undefined,
    })
  }

  private static toBase36(date: Date): string {
    return Math.floor(date.getTime() / this.interval).toString(this.base)
  }

  private static toDate(base36: string): Date {
    return new Date(parseInt(base36, this.base) * this.interval)
  }
}
