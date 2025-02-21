import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1739806411047 implements MigrationInterface {
  name = 'Migration1739806411047'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recruit_applicants" RENAME COLUMN "profileId" TO "profile_id"`)
    await queryRunner.query(
      `ALTER TABLE "recruit_applicants" ADD CONSTRAINT "UNIQUE_RECRUIT_APPLICANT_PROFILE" UNIQUE ("profile_id", "recruit_id")`,
    )
    await queryRunner.query(
      `ALTER TABLE "recruit_role_moderators" ADD CONSTRAINT "UNIQUE_RECRUIT_MODERATOR_PROFILE_ROLE" UNIQUE ("profile_id", "role_id")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recruit_role_moderators" DROP CONSTRAINT "UNIQUE_RECRUIT_MODERATOR_PROFILE_ROLE"`,
    )
    await queryRunner.query(`ALTER TABLE "recruit_applicants" DROP CONSTRAINT "UNIQUE_RECRUIT_APPLICANT_PROFILE"`)
    await queryRunner.query(`ALTER TABLE "recruit_applicants" RENAME COLUMN "profile_id" TO "profileId"`)
  }
}
