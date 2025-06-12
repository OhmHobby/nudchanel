import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1749660553033 implements MigrationInterface {
  name = 'Migration1749660553033'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recruit_interview_slots" ADD "google_calendar_event_id" text`)
    await queryRunner.query(`ALTER TABLE "recruit_interview_slots" ADD "conference_uri" text`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recruit_interview_slots" DROP COLUMN "conference_uri"`)
    await queryRunner.query(`ALTER TABLE "recruit_interview_slots" DROP COLUMN "google_calendar_event_id"`)
  }
}
