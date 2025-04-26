import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { GalleryReportEntity } from 'src/entities/gallery/gallery-report.entity'
import { Repository } from 'typeorm'

@Injectable()
export class GalleryReportService {
  constructor(
    @InjectRepository(GalleryReportEntity) private readonly reportRepository: Repository<GalleryReportEntity>,
  ) {}

  createReport(reason: string, photoId: string, albumId: string, reportBy: string | null, email: string | null) {
    const galleryReport = new GalleryReportEntity({
      reason,
      photoId,
      albumId,
      reportById: reportBy,
      email,
    })

    return this.reportRepository.save(galleryReport)
  }
}
