import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class SignInLocalUserRequestDto {
  @ApiProperty({ type: String })
  @IsString()
  username: string

  @ApiProperty({ type: String })
  @IsString()
  password: string

  @ApiProperty({ type: Boolean, required: false })
  @IsBoolean()
  @IsOptional()
  persistent?: boolean
}
