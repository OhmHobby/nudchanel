import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1740068620638 implements MigrationInterface {
  name = 'Migration1740068620638'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "recruit_surveys" ("id" SERIAL NOT NULL, "recruit_id" uuid NOT NULL, "collection_id" uuid, CONSTRAINT "UNIQUE_RECRUIT_SURVEY" UNIQUE ("recruit_id", "collection_id"), CONSTRAINT "PK_615f7fe585a0f225805e51d9288" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_surveys" ADD CONSTRAINT "FK_ed9c5911594c4f43b61071d489a" FOREIGN KEY ("recruit_id") REFERENCES "recruit_settings"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_surveys" ADD CONSTRAINT "FK_7a1f19082709415953721df9520" FOREIGN KEY ("collection_id") REFERENCES "recruit_form_collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `INSERT INTO recruit_surveys (recruit_id, collection_id) SELECT recruit_settings.id, recruit_settings.survey_collection_id FROM recruit_settings WHERE recruit_settings.survey_collection_id IS NOT NULL`,
    )
    await queryRunner.query(`ALTER TABLE "recruit_settings" DROP CONSTRAINT "FK_906eae4877853ad9d7cf2f6c478"`)
    await queryRunner.query(`ALTER TABLE "recruit_settings" DROP COLUMN "survey_collection_id"`)
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recruit_settings" ADD "survey_collection_id" uuid`)
    await queryRunner.query(
      `ALTER TABLE "recruit_settings" ADD CONSTRAINT "FK_906eae4877853ad9d7cf2f6c478" FOREIGN KEY ("survey_collection_id") REFERENCES "recruit_form_collections"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
    await queryRunner.query(
      `UPDATE recruit_settings SET survey_collection_id = rs.collection_id FROM (SELECT recruit_id, collection_id FROM recruit_surveys) AS rs WHERE recruit_settings.id = rs.recruit_id`,
    )
    await queryRunner.query(`ALTER TABLE "recruit_surveys" DROP CONSTRAINT "FK_7a1f19082709415953721df9520"`)
    await queryRunner.query(`ALTER TABLE "recruit_surveys" DROP CONSTRAINT "FK_ed9c5911594c4f43b61071d489a"`)
    await queryRunner.query(`DROP TABLE "recruit_surveys"`)
  }
}
