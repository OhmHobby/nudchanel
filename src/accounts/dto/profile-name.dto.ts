import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'
import { ProfileNameLanguage, ProfileNameModel } from 'src/models/accounts/profile.name.model'

export class ProfileNameDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  title?: string

  lang: ProfileNameLanguage

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  firstname: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  lastname: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @Transform(({ value }) => value?.trim())
  nickname: string

  toModel(): ProfileNameModel {
    return new ProfileNameModel({
      lang: this.lang,
      title: this.title,
      firstname: this.firstname,
      lastname: this.lastname,
      nickname: this.nickname,
    })
  }
}
