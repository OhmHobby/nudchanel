import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsDate, IsOptional, IsUUID } from 'class-validator'

export class ApplicantOfferDto {
  @ApiProperty({ type: String, format: 'uuid' })
  @IsUUID()
  roleId: string

  @ApiProperty({ type: String, format: 'datetime', nullable: true, required: false })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  offerExpireAt?: Date | null
}
