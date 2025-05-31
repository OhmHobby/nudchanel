import { MigrationInterface, QueryRunner } from 'typeorm'

export class Migration1748614461123 implements MigrationInterface {
  name = 'Migration1748614461123'

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recruit_form_answers" ADD CONSTRAINT "UNIQUE_RECRUIT_FORM_ANSWER_APPLICANT_QUESTION" UNIQUE ("applicant_id", "question_id")`,
    )
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "recruit_form_answers" DROP CONSTRAINT "UNIQUE_RECRUIT_FORM_ANSWER_APPLICANT_QUESTION"`,
    )
  }
}
