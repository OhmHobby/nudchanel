import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1737564315052 implements MigrationInterface {
  name = 'Migration1737564315052'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "gallery_tags" ("id" SERIAL NOT NULL, "title" character varying(63) NOT NULL, CONSTRAINT "UNIQUE_TAG_TITLE" UNIQUE ("title"), CONSTRAINT "PK_307fd2b5c99a7f7fb204dfa72e3" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `CREATE TABLE "gallery_activities" ("id" character varying(7) NOT NULL, "title" character varying(255) NOT NULL, "description" character varying(255), "cover" uuid, "time" TIMESTAMP NOT NULL, "published" boolean NOT NULL DEFAULT false, "published_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_f0af67c09ff47847683802ac59f" PRIMARY KEY ("id")); COMMENT ON COLUMN "gallery_activities"."cover" IS 'Soft relation to photo'`,
    )
    await queryRunner.query(
      `CREATE TABLE "gallery_activity_tags" ("activity_id" character varying(7) NOT NULL, "tag_id" integer NOT NULL, CONSTRAINT "PK_5a8632ebbfa0f7b98f7c5a7b771" PRIMARY KEY ("activity_id", "tag_id"))`,
    )
    await queryRunner.query(`CREATE INDEX "IDX_219a1de52cc95d25ede59eb89a" ON "gallery_activity_tags" ("activity_id") `)
    await queryRunner.query(`CREATE INDEX "IDX_32d4e1570c8268d2bfac85e6f4" ON "gallery_activity_tags" ("tag_id") `)
    await queryRunner.query(
      `ALTER TABLE "gallery_activity_tags" ADD CONSTRAINT "FK_219a1de52cc95d25ede59eb89ad" FOREIGN KEY ("activity_id") REFERENCES "gallery_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
    await queryRunner.query(
      `ALTER TABLE "gallery_activity_tags" ADD CONSTRAINT "FK_32d4e1570c8268d2bfac85e6f46" FOREIGN KEY ("tag_id") REFERENCES "gallery_tags"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "gallery_activity_tags" DROP CONSTRAINT "FK_32d4e1570c8268d2bfac85e6f46"`)
    await queryRunner.query(`ALTER TABLE "gallery_activity_tags" DROP CONSTRAINT "FK_219a1de52cc95d25ede59eb89ad"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_32d4e1570c8268d2bfac85e6f4"`)
    await queryRunner.query(`DROP INDEX "public"."IDX_219a1de52cc95d25ede59eb89a"`)
    await queryRunner.query(`DROP TABLE "gallery_activity_tags"`)
    await queryRunner.query(`DROP TABLE "gallery_activities"`)
    await queryRunner.query(`DROP TABLE "gallery_tags"`)
  }
}
