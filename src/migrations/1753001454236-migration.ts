import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1753001454236 implements MigrationInterface {
  name = 'Migration1753001454236'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "profile_discords" RENAME COLUMN "profileId" TO "profile_id"`)
    await queryRunner.query(
      `CREATE TABLE "profile_gitlabs" ("id" integer NOT NULL, "profile_id" uuid NOT NULL, "mfa_enabled" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_d2b30b8a023870fbd2c80efa4de" PRIMARY KEY ("id")); COMMENT ON COLUMN "profile_gitlabs"."id" IS 'GitLab user ID'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "profile_gitlabs"`)
    await queryRunner.query(`ALTER TABLE "profile_discords" RENAME COLUMN "profile_id" TO "profileId"`)
  }
}
