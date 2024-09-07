import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsBoolean, IsOptional } from 'class-validator'

export class SignInExternalRedirectDto {
  @ApiPropertyOptional({ description: 'redirect to uri' })
  continue: string

  @ApiPropertyOptional({ description: 'Auto redirect to sign in prompt - default: true', example: false })
  @Transform(({ value }) => value !== false.toString())
  @IsBoolean()
  @IsOptional()
  redirect: boolean = true
}
