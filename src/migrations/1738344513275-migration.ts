import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1738344513275 implements MigrationInterface {
  name = 'Migration1738344513275'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "public"."image_orientation" AS ENUM('1', '3', '6', '8')`)
    await queryRunner.query(
      `CREATE TABLE "gallery_photos" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "directory" text NOT NULL, "filename" text NOT NULL, "md5" uuid, "width" smallint, "height" smallint, "orientation" "public"."image_orientation", "taken_when" TIMESTAMP WITH TIME ZONE, "taken_by" uuid, "color" integer, "validated_at" TIMESTAMP WITH TIME ZONE, "processed_at" TIMESTAMP WITH TIME ZONE, "reviewed_by" uuid, "reject_reason" text, "error_message" text, "created_by" uuid NOT NULL, "import_id" uuid, "album_id" character varying(7), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP WITH TIME ZONE, CONSTRAINT "width must be greater than 0" CHECK (width > 0), CONSTRAINT "height must be greater than 0" CHECK (height > 0), CONSTRAINT "color must be between 0 and 16777215" CHECK (color >= 0 AND color <= 16777215), CONSTRAINT "PK_1eafc909ffac8de65a50960e440" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "gallery_photos" ADD CONSTRAINT "FK_4d9262e31d786a8cad0d81a987a" FOREIGN KEY ("album_id") REFERENCES "gallery_albums"("id") ON DELETE SET NULL ON UPDATE CASCADE`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "gallery_photos" DROP CONSTRAINT "FK_4d9262e31d786a8cad0d81a987a"`)
    await queryRunner.query(`DROP TABLE "gallery_photos"`)
    await queryRunner.query(`DROP TYPE "public"."image_orientation"`)
  }
}
