import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsUUID } from 'class-validator'

export class ApplicantOfferResponseDto {
  @IsBoolean()
  @ApiProperty()
  isAccepted: boolean

  @IsUUID()
  @ApiProperty()
  roleId: string
}
