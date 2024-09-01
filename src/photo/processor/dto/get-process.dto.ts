import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsPositive, IsString, Max, Min } from 'class-validator'
import config from 'config'
import { Config } from 'src/enums/config.enum'
import { ImageFit } from 'src/enums/image-fit.enum'
import { ImageFormat } from 'src/enums/image-format.enum'
import { ProcessPhotoParams } from '../process-photo-params'
import { IProcessPhotoParams } from '../process-photo-params.interface'
import { FileDto } from './base-file.dto'

export class GetProcessDto extends FileDto implements IProcessPhotoParams {
  constructor(dto?: Partial<GetProcessDto>) {
    super()
    Object.assign(this, dto)
  }

  @ApiProperty({ enum: ImageFormat, default: ImageFormat.jpeg })
  @IsEnum(ImageFormat)
  format: ImageFormat = ImageFormat.jpeg

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  width?: number

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  height?: number

  @ApiPropertyOptional({ type: Number, default: config.get<number>(Config.PHOTO_PROCESSOR_DEFAULT_QUALITY) })
  @IsOptional()
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  quality: number = config.get<number>(Config.PHOTO_PROCESSOR_DEFAULT_QUALITY)

  @ApiPropertyOptional({ enum: ImageFit })
  @IsOptional()
  @IsEnum(ImageFit)
  fit: ImageFit = ImageFit.inside

  @ApiPropertyOptional({ type: String, description: 'Watermark preset' })
  @IsOptional()
  @IsString()
  watermark?: string

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsPositive()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  widthRatio?: number = ProcessPhotoParams.defaultCropRatio

  @ApiPropertyOptional({ type: Number })
  @IsOptional()
  @IsPositive()
  @Min(0)
  @Max(1)
  @Type(() => Number)
  heightRatio?: number = ProcessPhotoParams.defaultCropRatio
}
