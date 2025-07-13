import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1752316038543 implements MigrationInterface {
  name = 'Migration1752316038543'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "user_local_users" ("id" SERIAL NOT NULL, "profile_id" uuid NOT NULL, "username" text NOT NULL, "password" text NOT NULL, "password_last_set" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "disabled" boolean NOT NULL DEFAULT false, CONSTRAINT "UQ_1ed1e358eb36b4d465f4a07ed80" UNIQUE ("username"), CONSTRAINT "PK_beab43b56d038c926cca6d133b5" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "user_local_users"`)
  }
}
