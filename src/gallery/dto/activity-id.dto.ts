import { ApiProperty } from '@nestjs/swagger'

export class ActivityIdDto {
  @ApiProperty({ type: 'string' })
  activityId: string
}
