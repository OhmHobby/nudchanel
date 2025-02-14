import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1739461218430 implements MigrationInterface {
  name = 'Migration1739461218430'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recruit_role_moderators" DROP CONSTRAINT "FK_86408c88780a31a7c79f6b3fb05"`)
    await queryRunner.query(`DROP TABLE "recruit_role_moderators"`)
    await queryRunner.query(
      `CREATE TABLE "recruit_role_moderators" ("id" SERIAL NOT NULL, "profile_id" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_03ba675f8d2ffcd91671ec16453" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_role_moderators" ADD CONSTRAINT "FK_86408c88780a31a7c79f6b3fb05" FOREIGN KEY ("role_id") REFERENCES "recruit_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recruit_role_moderators" DROP CONSTRAINT "FK_86408c88780a31a7c79f6b3fb05"`)
    await queryRunner.query(`DROP TABLE "recruit_role_moderators"`)
    await queryRunner.query(
      `CREATE TABLE "recruit_role_moderators" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "profileId" uuid NOT NULL, "role_id" uuid NOT NULL, CONSTRAINT "PK_03ba675f8d2ffcd91671ec16453" PRIMARY KEY ("id"))`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_role_moderators" ADD CONSTRAINT "FK_86408c88780a31a7c79f6b3fb05" FOREIGN KEY ("role_id") REFERENCES "recruit_roles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    )
  }
}
