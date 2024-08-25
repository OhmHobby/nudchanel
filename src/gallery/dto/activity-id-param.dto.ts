import { ApiProperty } from '@nestjs/swagger'

export class ActivityIdParamDto {
  @ApiProperty({ type: 'string' })
  activityId: string
}
