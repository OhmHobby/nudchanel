import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1752254711495 implements MigrationInterface {
  name = 'Migration1752254711495'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD "is_mfa_enabled" boolean NOT NULL DEFAULT false`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP COLUMN "is_mfa_enabled"`)
  }
}
