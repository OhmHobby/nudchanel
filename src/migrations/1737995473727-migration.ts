import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1737995473727 implements MigrationInterface {
  name = 'Migration1737995473727'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gallery_activities" ALTER "updated_at" TYPE timestamptz USING "updated_at" AT TIME ZONE 'Asia/Bangkok'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gallery_activities" ALTER "updated_at" TYPE timestamp USING "updated_at" AT TIME ZONE 'Asia/Bangkok'`,
    )
  }
}
