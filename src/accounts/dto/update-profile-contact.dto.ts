import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsArray, IsEmail, IsOptional, IsString } from 'class-validator'

export class UpdateProfileContactDto {
  @ApiPropertyOptional({
    type: [String],
    description: 'Array of email addresses',
    example: ['user@example.com', 'user2@example.com'],
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  @Transform(({ value }) => value?.map((email: string) => email?.toLowerCase()?.trim()))
  emails?: string[]

  @ApiPropertyOptional({
    type: [String],
    description: 'Array of phone numbers',
    example: ['0800000000'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @Transform(({ value }) => value?.map((tel: string) => tel?.trim()))
  tels?: string[]
}
