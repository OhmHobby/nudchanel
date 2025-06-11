import { Injectable, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { RecruitNoteEntity } from 'src/entities/recruit/recruit-note.entity'
import { Repository } from 'typeorm'

@Injectable()
export class RecruitNoteService {
  constructor(
    @InjectRepository(RecruitNoteEntity)
    private readonly noteRepository: Repository<RecruitNoteEntity>,
  ) {}

  async getNotes(applicantId: string, profileUid: string) {
    return await this.noteRepository.find({
      where: [
        { applicantId, onlyMe: false },
        { applicantId, onlyMe: true, createdBy: profileUid },
      ],
      select: { id: true, note: true, onlyMe: true, createdBy: true },
      order: { id: 'ASC' },
    })
  }

  async createNote(entity: RecruitNoteEntity) {
    return await this.noteRepository.save(entity)
  }

  async editNote(noteId: string, entity: Partial<RecruitNoteEntity>, editBy: string) {
    const result = await this.noteRepository.update({ id: noteId, createdBy: editBy }, entity)
    if (result.affected === 0) {
      throw new NotFoundException('Note not found')
    }
    return result
  }

  async deleteNote(noteId: string, deleteBy: string) {
    const result = await this.noteRepository.delete({ id: noteId, createdBy: deleteBy })
    if (result.affected === 0) {
      throw new NotFoundException('Note not found')
    }
    return result
  }
}
