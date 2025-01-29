import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1738120534658 implements MigrationInterface {
  name = 'Migration1738120534658'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "gallery_albums" ("id" character varying(7) NOT NULL, "title" character varying(255) NOT NULL, "cover" uuid, "rank" smallint NOT NULL DEFAULT '0', "activity_id" character varying(7), "published" boolean NOT NULL DEFAULT false, "published_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_fe2edc1b9abda19559a9bf1df8d" PRIMARY KEY ("id")); COMMENT ON COLUMN "gallery_albums"."cover" IS 'Soft relation to photo'`,
    )
    await queryRunner.query(
      `ALTER TABLE "gallery_albums" ADD CONSTRAINT "FK_9fda1ad8cc28999d0ae70d7b3b9" FOREIGN KEY ("activity_id") REFERENCES "gallery_activities"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "gallery_albums" DROP CONSTRAINT "FK_9fda1ad8cc28999d0ae70d7b3b9"`)
    await queryRunner.query(`DROP TABLE "gallery_albums"`)
  }
}
