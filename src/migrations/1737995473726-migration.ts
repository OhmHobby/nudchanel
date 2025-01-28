import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1737995473726 implements MigrationInterface {
  name = 'Migration1737995473726'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gallery_activities" ALTER "created_at" TYPE timestamptz USING "created_at" AT TIME ZONE 'Asia/Bangkok'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gallery_activities" ALTER "created_at" TYPE timestamp USING "created_at" AT TIME ZONE 'Asia/Bangkok'`,
    )
  }
}
