import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class UuidParamDto {
  @ApiProperty()
  @IsUUID()
  id: string
}
