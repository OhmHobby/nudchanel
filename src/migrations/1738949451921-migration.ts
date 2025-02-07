import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1738949451921 implements MigrationInterface {
  name = 'Migration1738949451921'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "application_settings" ADD "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "application_settings" DROP COLUMN "updated_at"`)
  }
}
