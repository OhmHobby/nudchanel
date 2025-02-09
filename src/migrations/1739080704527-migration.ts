import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1739080704527 implements MigrationInterface {
  name = 'Migration1739080704527'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "gallery_photos" ADD "reject_message" text`)
    await queryRunner.query(`ALTER TABLE "gallery_photos" DROP COLUMN "reject_reason"`)
    await queryRunner.query(
      `CREATE TYPE "public"."gallery_photo_reject_reason" AS ENUM('duplicated', 'resolution', 'timestamp', 'other')`,
    )
    await queryRunner.query(`ALTER TABLE "gallery_photos" ADD "reject_reason" "public"."gallery_photo_reject_reason"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "gallery_photos" DROP COLUMN "reject_reason"`)
    await queryRunner.query(`DROP TYPE "public"."gallery_photo_reject_reason"`)
    await queryRunner.query(`ALTER TABLE "gallery_photos" ADD "reject_reason" text`)
    await queryRunner.query(`ALTER TABLE "gallery_photos" DROP COLUMN "reject_message"`)
  }
}
