import { ApiProperty } from '@nestjs/swagger'
import { IsString } from 'class-validator'

export class ActivityIdQueryDto {
  @ApiProperty({ type: 'string' })
  @IsString()
  activityId: string
}
