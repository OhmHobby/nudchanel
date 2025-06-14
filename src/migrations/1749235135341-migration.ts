import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1749235135341 implements MigrationInterface {
  name = 'Migration1749235135341'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recruit_applicant_roles" RENAME COLUMN "offerAccepted" TO "offer_accepted"`)
    await queryRunner.query(
      `ALTER TABLE "recruit_applicant_roles" ADD CONSTRAINT "applicant_role_unique" UNIQUE ("applicant_id", "role_id")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "recruit_applicant_roles" DROP CONSTRAINT "applicant_role_unique"`)
    await queryRunner.query(`ALTER TABLE "recruit_applicant_roles" RENAME COLUMN "offer_accepted" TO "offerAccepted"`)
  }
}
