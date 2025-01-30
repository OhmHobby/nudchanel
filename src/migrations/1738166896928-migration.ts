import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1738166896928 implements MigrationInterface {
  name = 'Migration1738166896928'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "gallery_albums" ADD "upload_directory" text`)
    await queryRunner.query(`ALTER TABLE "gallery_albums" ADD "watermark_preset" text`)
    await queryRunner.query(`ALTER TABLE "gallery_albums" ADD "minimum_resolution_mp" smallint`)
    await queryRunner.query(`ALTER TABLE "gallery_albums" ADD "taken_after" TIMESTAMP WITH TIME ZONE`)
    await queryRunner.query(`ALTER TABLE "gallery_albums" ADD "taken_before" TIMESTAMP WITH TIME ZONE`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "gallery_albums" DROP COLUMN "taken_before"`)
    await queryRunner.query(`ALTER TABLE "gallery_albums" DROP COLUMN "taken_after"`)
    await queryRunner.query(`ALTER TABLE "gallery_albums" DROP COLUMN "minimum_resolution_mp"`)
    await queryRunner.query(`ALTER TABLE "gallery_albums" DROP COLUMN "watermark_preset"`)
    await queryRunner.query(`ALTER TABLE "gallery_albums" DROP COLUMN "upload_directory"`)
  }
}
