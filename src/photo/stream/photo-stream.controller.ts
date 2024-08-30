import { Controller, Get, Param, Req, Res, StreamableFile } from '@nestjs/common'
import { ApiHeader, ApiOkResponse, ApiResponseOptions, ApiTags } from '@nestjs/swagger'
import { Request, Response } from 'express'
import { CONTENT_DISPOSITION, IF_NONE_MATCH } from 'src/constants/headers.constants'
import { Readable } from 'stream'
import { DownloadPhotoDto } from '../dto/download-photo-dto'
import { GetPhotoDto } from '../dto/get-photo-dto'
import { GetProfilePhotoDto } from '../dto/get-profile-photo-dto'
import { IPhotoPath } from '../models/photo-path.interface'
import { PhotoPath } from '../models/photo-path.model'
import { ProfilePhotoPath } from '../models/profile-photo-path.model'
import { PhotoStreamService } from './photo-stream.service'

@Controller({ path: 'photos' })
@ApiTags('PhotoStream')
export class PhotoStreamController {
  static JpegMime = 'image/jpeg'

  static WebpMime = 'image/webp'

  static apiResponseOptions: ApiResponseOptions = {
    content: {
      [PhotoStreamController.JpegMime]: { schema: { type: 'string', format: 'binary' } },
      [PhotoStreamController.WebpMime]: { schema: { type: 'string', format: 'binary' } },
    },
  }

  constructor(private readonly photoService: PhotoStreamService) {}

  @Get('profiles/:uuid.:ext')
  @ApiHeader({ name: IF_NONE_MATCH })
  @ApiOkResponse(PhotoStreamController.apiResponseOptions)
  async getProfilePhoto(
    @Req() request: Request,
    @Param() dto: GetProfilePhotoDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile | undefined> {
    const photoPath = ProfilePhotoPath.fromGetProfilePhotoDto(dto)
    const stream = await this.photoService.getPhotoProfileStream(response, photoPath, request.headers[IF_NONE_MATCH])
    if (stream) return this.responseStream(response, stream, photoPath)
  }

  @Get('download/:uuid.jpg')
  @ApiHeader({ name: IF_NONE_MATCH })
  @ApiOkResponse(PhotoStreamController.apiResponseOptions)
  async downloadPhoto(
    @Req() request: Request,
    @Param() dto: DownloadPhotoDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile | undefined> {
    const photoPath = PhotoPath.fromDownloadPhotoDto(dto)

    const stream = await this.photoService.getPhotoStream(response, photoPath, request.headers[IF_NONE_MATCH])
    if (stream) return this.responseStream(response, stream, photoPath, 'attachment')
  }

  @Get(':size/:uuid.:ext')
  @ApiHeader({ name: IF_NONE_MATCH })
  @ApiOkResponse(PhotoStreamController.apiResponseOptions)
  async getPhoto(
    @Req() request: Request,
    @Param() dto: GetPhotoDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<StreamableFile | undefined> {
    const photoPath = PhotoPath.fromGetPhotoDto(dto)

    const stream = await this.photoService.getPhotoStream(response, photoPath, request.headers[IF_NONE_MATCH])
    if (stream) return this.responseStream(response, stream, photoPath)
  }

  private responseStream(response: Response, stream: Readable, photoPath: IPhotoPath, disposition = 'inline') {
    response.type(photoPath.mime)
    response.set(CONTENT_DISPOSITION, `${disposition};filename=${photoPath.filename}`)
    this.photoService.setCacheHeaders(response)
    return new StreamableFile(stream)
  }
}
