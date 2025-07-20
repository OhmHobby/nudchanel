import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1752989234955 implements MigrationInterface {
  name = 'Migration1752989234955'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "profile_discords" ("id" bigint NOT NULL, "profileId" uuid NOT NULL, "rank" integer NOT NULL DEFAULT '0', "avatar" text, "mfa_enabled" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_9a30d63700894a4bfbb3516e9c4" PRIMARY KEY ("id")); COMMENT ON COLUMN "profile_discords"."id" IS 'Discord user ID (Snowflake uint64)'`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "profile_discords"`)
  }
}
