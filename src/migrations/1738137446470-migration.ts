import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1738137446470 implements MigrationInterface {
  name = 'Migration1738137446470'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "gallery_youtube_videos" ("id" character varying(11) NOT NULL, "activity_id" character varying(7), "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_69dcb2bb6ab104b898565ad252d" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "gallery_youtube_videos" ADD CONSTRAINT "FK_3309d2355904abda0192a7ab48b" FOREIGN KEY ("activity_id") REFERENCES "gallery_activities"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "gallery_youtube_videos" DROP CONSTRAINT "FK_3309d2355904abda0192a7ab48b"`)
    await queryRunner.query(`DROP TABLE "gallery_youtube_videos"`)
  }
}
