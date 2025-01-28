import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1737995473728 implements MigrationInterface {
  name = 'Migration1737995473728'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gallery_activities" ALTER "deleted_at" TYPE timestamptz USING "deleted_at" AT TIME ZONE 'Asia/Bangkok'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gallery_activities" ALTER "deleted_at" TYPE timestamp USING "deleted_at" AT TIME ZONE 'Asia/Bangkok'`,
    )
  }
}
