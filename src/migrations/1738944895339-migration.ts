import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1738944895339 implements MigrationInterface {
  name = 'Migration1738944895339'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "correlation_id" uuid, "actor" uuid, "action" text NOT NULL, "path" text, "params" jsonb, "queries" jsonb, "body" jsonb, CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "audit_logs"`)
  }
}
