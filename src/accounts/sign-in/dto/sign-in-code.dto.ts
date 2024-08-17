import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'

export class SignInCodeDto {
  constructor(dto?: Partial<SignInCodeDto>) {
    Object.assign(this, dto)
  }

  @ApiProperty({ description: 'Sign-in code' })
  @IsUUID()
  code: string

  @ApiPropertyOptional({ description: 'Redirect to uri', default: '/' })
  continue: string = '/'
}
