import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1749743012257 implements MigrationInterface {
  name = 'Migration1749743012257'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "nud_students" ("id" SERIAL NOT NULL, "profile_id" uuid, "student_id" text NOT NULL, "academic_year" integer NOT NULL, "class_year" integer NOT NULL, "class_name" text, "rank" integer, CONSTRAINT "UNIQUE_STUDENT_PROFILE_YEAR" UNIQUE ("student_id", "profile_id", "academic_year"), CONSTRAINT "PK_3fd73502910290fabe7522e8768" PRIMARY KEY ("id"))`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "nud_students"`)
  }
}
