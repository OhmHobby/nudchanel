import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1749835383998 implements MigrationInterface {
  name = 'Migration1749835383998'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recruit_roles" ADD "icon" text`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recruit_roles" DROP COLUMN "icon"`)
  }
}
