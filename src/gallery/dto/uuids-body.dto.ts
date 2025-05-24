import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsUUID } from 'class-validator'

export class UuidsBodyDto {
  @ApiProperty()
  @IsUUID()
  @IsArray()
  ids: string[]
}
