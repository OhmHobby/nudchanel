import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1743329597479 implements MigrationInterface {
  name = 'Migration1743329597479'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."gallery_report_state" AS ENUM('pending', 'accepted', 'rejected')`)
    await queryRunner.query(
      `CREATE TABLE "gallery_reports" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "reason" text NOT NULL, "album_id" uuid, "photo_id" uuid, "state" "public"."gallery_report_state" NOT NULL DEFAULT 'pending', "report_by_id" uuid, "email" character varying(255), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_397190fc3163dc793c33495e4d5" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(`ALTER TABLE "recruit_settings" ADD "survey_collection_id" uuid`)
    await queryRunner.query(
      `ALTER TABLE "recruit_settings" ADD CONSTRAINT "FK_906eae4877853ad9d7cf2f6c478" FOREIGN KEY ("survey_collection_id") REFERENCES "recruit_form_collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recruit_settings" DROP CONSTRAINT "FK_906eae4877853ad9d7cf2f6c478"`)
    await queryRunner.query(`ALTER TABLE "recruit_settings" DROP COLUMN "survey_collection_id"`)
    await queryRunner.query(`DROP TABLE "gallery_reports"`)
    await queryRunner.query(`DROP TYPE "public"."gallery_report_state"`)
  }
}
