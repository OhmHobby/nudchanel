import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1737995473725 implements MigrationInterface {
  name = 'Migration1737995473725'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gallery_activities" ALTER "time" TYPE timestamptz USING "time" AT TIME ZONE 'Asia/Bangkok'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gallery_activities" ALTER "time" TYPE timestamp USING "time" AT TIME ZONE 'Asia/Bangkok'`,
    )
  }
}
