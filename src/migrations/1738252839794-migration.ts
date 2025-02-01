import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1738252839794 implements MigrationInterface {
  name = 'Migration1738252839794'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "application_settings" ("id" text NOT NULL, "value" text NOT NULL, CONSTRAINT "PK_84c911c1d401de2adbc8060b6d2" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "application_settings"`)
  }
}
