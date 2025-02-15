import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1739379216475 implements MigrationInterface {
  name = 'Migration1739379216475'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "profile_photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profile_id" uuid NOT NULL, "directory" text NOT NULL, "filename" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_a7e588425c00912ee9e50f47dc1" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "profile_photos"`)
  }
}
