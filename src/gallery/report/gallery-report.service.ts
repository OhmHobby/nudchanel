import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { GalleryReportEntity } from 'src/entities/gallery/gallery-report.entity'
import { Repository } from 'typeorm'

@Injectable()
export class GalleryReportService {
  constructor(
    @InjectRepository(GalleryReportEntity) private readonly reportRepository: Repository<GalleryReportEntity>,
  ) {}

  createReport(title: string, description: string, photoId: string, reportBy: string) {
    const galleryReport = new GalleryReportEntity({
      title,
      description,
      photoId,
      reportById: reportBy,
    })

    return this.reportRepository.save(galleryReport)
  }
}
