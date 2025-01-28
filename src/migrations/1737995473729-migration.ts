import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1737995473729 implements MigrationInterface {
  name = 'Migration1737995473729'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gallery_activities" ALTER "published_at" TYPE timestamptz USING "published_at" AT TIME ZONE 'Asia/Bangkok'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "gallery_activities" ALTER "published_at" TYPE timestamp USING "published_at" AT TIME ZONE 'Asia/Bangkok'`,
    )
  }
}
