import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsMongoId, IsString } from 'class-validator'
import { Types } from 'mongoose'

export class GenerateDevTokenDto {
  @ApiProperty({ type: String, description: 'User ID' })
  @IsMongoId()
  userId: Types.ObjectId

  @ApiProperty({ type: [String], description: 'User groups', example: ['nudch'] })
  @IsArray()
  @IsString({ each: true })
  groups: string[] = []
}
