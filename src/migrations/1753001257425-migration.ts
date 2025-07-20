import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1753001257425 implements MigrationInterface {
  name = 'Migration1753001257425'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "profile_gitlab" ("id" integer NOT NULL, "profileId" uuid NOT NULL, "mfa_enabled" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_e7751ea2371886207f779113649" PRIMARY KEY ("id")); COMMENT ON COLUMN "profile_gitlab"."id" IS 'GitLab user ID'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "profile_gitlab"`)
  }
}
